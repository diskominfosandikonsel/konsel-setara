const db = require('../db/MySql/utama');

const MENU_DEFINITIONS = [
  { key: 'dashboard', label: 'Dashboard SKM', section: 'Dashboard' },
  { key: 'realisasi', label: 'Realisasi Setara', section: 'Program Prioritas' },
  { key: 'ulasan', label: 'Ulasan & Komentar', section: 'Survei Kepuasan' },
  { key: 'aplikasi', label: 'Aplikasi / Layanan', section: 'Survei Kepuasan' },
  { key: 'slider', label: 'Slider / Banner', section: 'Kelola Konten' },
  { key: 'menu', label: 'Menu Dinamis', section: 'Kelola Konten' },
  { key: 'video_konsel', label: 'Video Konsel', section: 'Kelola Konten' },
  { key: 'rup', label: 'Sinkronisasi RUP', section: 'Integrasi Data' },
  { key: 'guestbook_dashboard', label: 'Rekap / Dashboard', section: 'Buku Tamu' },
  { key: 'guestbook_monitoring', label: 'Monitoring Tamu', section: 'Buku Tamu' },
  { key: 'guestbook_qr', label: 'Generate QR', section: 'Buku Tamu' },
  { key: 'users', label: 'Manajemen User', section: 'Administrasi' },
  { key: 'pegawai', label: 'Hak Akses Pegawai', section: 'Administrasi' },
  { key: 'access_groups', label: 'Kelompok & Hak Akses', section: 'Administrasi' },
];

function queryAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

let initializationPromise;

function ensureAccessControlTables() {
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    await queryAsync(`
      CREATE TABLE IF NOT EXISTS access_groups (
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        description VARCHAR(255) DEFAULT '',
        is_system TINYINT(1) NOT NULL DEFAULT 0,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_access_groups_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryAsync(`
      CREATE TABLE IF NOT EXISTS access_group_permissions (
        group_id INT NOT NULL,
        menu_key VARCHAR(60) NOT NULL,
        can_read TINYINT(1) NOT NULL DEFAULT 0,
        can_create TINYINT(1) NOT NULL DEFAULT 0,
        can_update TINYINT(1) NOT NULL DEFAULT 0,
        can_delete TINYINT(1) NOT NULL DEFAULT 0,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (group_id, menu_key),
        KEY idx_access_permissions_menu (menu_key)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    const opdIdColumns = await queryAsync(`
      SELECT COUNT(*) AS total
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'pegawai_akses' AND COLUMN_NAME = 'opd_id'
    `);
    if (Number(opdIdColumns[0]?.total || 0) === 0) {
      await queryAsync('ALTER TABLE pegawai_akses ADD COLUMN opd_id VARCHAR(64) DEFAULT NULL AFTER opd');
    }

    await queryAsync(`
      INSERT INTO access_groups (id, name, description, is_system, is_active)
      VALUES
        (1, 'Administrator', 'Akses penuh ke seluruh modul administrasi.', 1, 1),
        (2, 'Admin OPD', 'Mengelola dashboard dan realisasi milik OPD.', 1, 1),
        (5, 'Admin Resepsionis', 'Mengelola penerimaan dan monitoring tamu pada OPD yang ditugaskan.', 1, 1),
        (6, 'Admin Arsiparis', 'Mengelola rekap dan arsip Buku Tamu pada OPD yang ditugaskan.', 1, 1)
      ON DUPLICATE KEY UPDATE
        is_system = VALUES(is_system),
        is_active = VALUES(is_active)
    `);

    await queryAsync('ALTER TABLE access_groups AUTO_INCREMENT = 100');

    for (const menu of MENU_DEFINITIONS) {
      await queryAsync(`
        INSERT INTO access_group_permissions
          (group_id, menu_key, can_read, can_create, can_update, can_delete)
        VALUES (1, ?, 1, 1, 1, 1)
        ON DUPLICATE KEY UPDATE
          can_read = 1,
          can_create = 1,
          can_update = 1,
          can_delete = 1
      `, [menu.key]);
    }

    const guestbookRoleDefaults = {
      guestbook_dashboard: [1, 0, 0, 0],
      guestbook_monitoring: [1, 0, 1, 0],
      guestbook_qr: [1, 1, 1, 0],
    };

    for (const roleId of [5, 6]) {
      for (const menu of MENU_DEFINITIONS) {
        const values = guestbookRoleDefaults[menu.key] || [0, 0, 0, 0];
        await queryAsync(`
          INSERT IGNORE INTO access_group_permissions
            (group_id, menu_key, can_read, can_create, can_update, can_delete)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [roleId, menu.key, ...values]);
      }
    }

    const opdDefaults = {
      dashboard: [1, 0, 0, 0],
      realisasi: [1, 1, 1, 1],
    };

    for (const menu of MENU_DEFINITIONS) {
      const values = opdDefaults[menu.key] || [0, 0, 0, 0];
      await queryAsync(`
        INSERT IGNORE INTO access_group_permissions
          (group_id, menu_key, can_read, can_create, can_update, can_delete)
        VALUES (2, ?, ?, ?, ?, ?)
      `, [menu.key, ...values]);
    }
  })().catch((error) => {
    initializationPromise = null;
    throw error;
  });

  return initializationPromise;
}

async function getGroupWithPermissions(groupId) {
  await ensureAccessControlTables();

  const groups = await queryAsync(`
    SELECT id, name, description, is_system, is_active, created_at, updated_at
    FROM access_groups
    WHERE id = ?
    LIMIT 1
  `, [groupId]);

  if (!groups.length) return null;

  const rows = await queryAsync(`
    SELECT menu_key, can_read, can_create, can_update, can_delete
    FROM access_group_permissions
    WHERE group_id = ?
  `, [groupId]);

  const isSuperAdmin = Number(groupId) === 1;
  const byMenu = new Map(rows.map((row) => [row.menu_key, row]));
  const permissions = MENU_DEFINITIONS.map((menu) => {
    const row = byMenu.get(menu.key) || {};
    return {
      ...menu,
      can_read: isSuperAdmin ? true : Boolean(row.can_read),
      can_create: isSuperAdmin ? true : Boolean(row.can_create),
      can_update: isSuperAdmin ? true : Boolean(row.can_update),
      can_delete: isSuperAdmin ? true : Boolean(row.can_delete),
    };
  });

  return {
    ...groups[0],
    is_system: Boolean(groups[0].is_system),
    is_active: Boolean(groups[0].is_active),
    permissions,
  };
}

function requireSuperAdmin(req, res, next) {
  if (Number(req.user?.menu_klp) !== 1) {
    return res.status(403).json({ success: false, message: 'Akses hanya untuk Administrator.' });
  }
  next();
}

function requirePermission(menuKey, action = 'read') {
  const columnByAction = {
    read: 'can_read',
    create: 'can_create',
    update: 'can_update',
    delete: 'can_delete',
  };

  return async (req, res, next) => {
    try {
      const groupId = Number(req.user?.menu_klp);
      const column = columnByAction[action];
      if (!groupId || !column) {
        return res.status(403).json({ success: false, message: 'Hak akses tidak valid.' });
      }

      await ensureAccessControlTables();
      const rows = await queryAsync(`
        SELECT p.${column} AS allowed
        FROM access_groups g
        INNER JOIN access_group_permissions p ON p.group_id = g.id
        WHERE g.id = ? AND g.is_active = 1 AND p.menu_key = ?
        LIMIT 1
      `, [groupId, menuKey]);

      if (!rows.length || Number(rows[0].allowed) !== 1) {
        return res.status(403).json({
          success: false,
          message: `Anda tidak memiliki izin ${action} untuk modul ini.`,
        });
      }

      next();
    } catch (error) {
      console.error('[ACCESS CONTROL] Permission check failed:', error.message);
      return res.status(500).json({ success: false, message: 'Gagal memverifikasi hak akses.' });
    }
  };
}

module.exports = {
  MENU_DEFINITIONS,
  ensureAccessControlTables,
  getGroupWithPermissions,
  queryAsync,
  requirePermission,
  requireSuperAdmin,
};
