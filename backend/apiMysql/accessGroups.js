const express = require('express');
const middleware = require('../auth/middlewares');
const {
  MENU_DEFINITIONS,
  ensureAccessControlTables,
  getGroupWithPermissions,
  queryAsync,
  requireSuperAdmin,
} = require('../auth/accessControl');

const router = express.Router();

router.use(middleware.isLoggedIn);

router.get('/my-permissions', async (req, res) => {
  try {
    const group = await getGroupWithPermissions(Number(req.user.menu_klp));
    if (!group || !group.is_active) {
      return res.status(403).json({ success: false, message: 'Kelompok akses tidak aktif atau tidak terdaftar.' });
    }
    return res.json({ success: true, data: group });
  } catch (error) {
    console.error('[ACCESS GROUPS] my-permissions:', error.message);
    return res.status(500).json({ success: false, message: 'Gagal mengambil hak akses pengguna.' });
  }
});

router.get('/options', async (req, res) => {
  try {
    await ensureAccessControlTables();
    const groups = await queryAsync(`
      SELECT id, name
      FROM access_groups
      WHERE is_active = 1
      ORDER BY id ASC
    `);
    return res.json({ success: true, data: groups });
  } catch (error) {
    console.error('[ACCESS GROUPS] options:', error.message);
    return res.status(500).json({ success: false, message: 'Gagal mengambil pilihan kelompok.' });
  }
});

router.get('/', requireSuperAdmin, async (req, res) => {
  try {
    await ensureAccessControlTables();
    const rows = await queryAsync(`
      SELECT id, name, description, is_system, is_active, created_at, updated_at
      FROM access_groups
      ORDER BY is_system DESC, id ASC
    `);
    const groups = await Promise.all(rows.map((row) => getGroupWithPermissions(row.id)));
    return res.json({
      success: true,
      data: groups,
      menus: MENU_DEFINITIONS,
    });
  } catch (error) {
    console.error('[ACCESS GROUPS] list:', error.message);
    return res.status(500).json({ success: false, message: 'Gagal mengambil kelompok akses.' });
  }
});

router.post('/', requireSuperAdmin, async (req, res) => {
  try {
    await ensureAccessControlTables();
    const name = String(req.body.name || '').trim();
    const description = String(req.body.description || '').trim();

    if (name.length < 3 || name.length > 100) {
      return res.status(422).json({ success: false, message: 'Nama kelompok harus 3–100 karakter.' });
    }
    if (description.length > 255) {
      return res.status(422).json({ success: false, message: 'Deskripsi maksimal 255 karakter.' });
    }

    const result = await queryAsync(`
      INSERT INTO access_groups (name, description, is_system, is_active)
      VALUES (?, ?, 0, 1)
    `, [name, description]);

    for (const menu of MENU_DEFINITIONS) {
      await queryAsync(`
        INSERT INTO access_group_permissions
          (group_id, menu_key, can_read, can_create, can_update, can_delete)
        VALUES (?, ?, 0, 0, 0, 0)
      `, [result.insertId, menu.key]);
    }

    const group = await getGroupWithPermissions(result.insertId);
    return res.status(201).json({ success: true, message: 'Kelompok berhasil ditambahkan.', data: group });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Nama kelompok sudah digunakan.' });
    }
    console.error('[ACCESS GROUPS] create:', error.message);
    return res.status(500).json({ success: false, message: 'Gagal menambahkan kelompok.' });
  }
});

router.put('/:id', requireSuperAdmin, async (req, res) => {
  try {
    await ensureAccessControlTables();
    const id = Number(req.params.id);
    const name = String(req.body.name || '').trim();
    const description = String(req.body.description || '').trim();
    const isActive = req.body.is_active === false || Number(req.body.is_active) === 0 ? 0 : 1;

    if (!Number.isInteger(id) || id < 1) {
      return res.status(422).json({ success: false, message: 'ID kelompok tidak valid.' });
    }
    if (name.length < 3 || name.length > 100 || description.length > 255) {
      return res.status(422).json({ success: false, message: 'Nama atau deskripsi kelompok tidak valid.' });
    }

    const existing = await queryAsync('SELECT is_system FROM access_groups WHERE id = ? LIMIT 1', [id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Kelompok tidak ditemukan.' });
    if (existing[0].is_system) {
      return res.status(422).json({ success: false, message: 'Identitas kelompok bawaan tidak dapat diubah.' });
    }

    await queryAsync(`
      UPDATE access_groups
      SET name = ?, description = ?, is_active = ?
      WHERE id = ?
    `, [name, description, isActive, id]);

    return res.json({ success: true, message: 'Kelompok berhasil diperbarui.' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Nama kelompok sudah digunakan.' });
    }
    console.error('[ACCESS GROUPS] update:', error.message);
    return res.status(500).json({ success: false, message: 'Gagal memperbarui kelompok.' });
  }
});

router.put('/:id/permissions', requireSuperAdmin, async (req, res) => {
  try {
    await ensureAccessControlTables();
    const id = Number(req.params.id);
    const permissions = Array.isArray(req.body.permissions) ? req.body.permissions : [];
    const existing = await queryAsync('SELECT is_system FROM access_groups WHERE id = ? LIMIT 1', [id]);

    if (!existing.length) return res.status(404).json({ success: false, message: 'Kelompok tidak ditemukan.' });
    if (id === 1) {
      return res.status(422).json({ success: false, message: 'Administrator wajib memiliki akses penuh.' });
    }

    const allowedKeys = new Set(MENU_DEFINITIONS.map((menu) => menu.key));
    const normalized = permissions
      .filter((item) => allowedKeys.has(item.menu_key))
      .map((item) => {
        if (item.menu_key === 'access_groups') {
          return {
            menu_key: item.menu_key,
            can_read: 0,
            can_create: 0,
            can_update: 0,
            can_delete: 0,
          };
        }
        const canRead = Boolean(item.can_read);
        return {
          menu_key: item.menu_key,
          can_read: canRead ? 1 : 0,
          can_create: canRead && item.can_create ? 1 : 0,
          can_update: canRead && item.can_update ? 1 : 0,
          can_delete: canRead && item.can_delete ? 1 : 0,
        };
      });

    for (const menu of MENU_DEFINITIONS) {
      const item = normalized.find((permission) => permission.menu_key === menu.key) || {
        menu_key: menu.key,
        can_read: 0,
        can_create: 0,
        can_update: 0,
        can_delete: 0,
      };
      await queryAsync(`
        INSERT INTO access_group_permissions
          (group_id, menu_key, can_read, can_create, can_update, can_delete)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          can_read = VALUES(can_read),
          can_create = VALUES(can_create),
          can_update = VALUES(can_update),
          can_delete = VALUES(can_delete)
      `, [id, item.menu_key, item.can_read, item.can_create, item.can_update, item.can_delete]);
    }

    const group = await getGroupWithPermissions(id);
    return res.json({ success: true, message: 'Hak akses berhasil disimpan.', data: group });
  } catch (error) {
    console.error('[ACCESS GROUPS] permissions:', error.message);
    return res.status(500).json({ success: false, message: 'Gagal menyimpan hak akses.' });
  }
});

router.delete('/:id', requireSuperAdmin, async (req, res) => {
  try {
    await ensureAccessControlTables();
    const id = Number(req.params.id);
    const groups = await queryAsync('SELECT is_system FROM access_groups WHERE id = ? LIMIT 1', [id]);
    if (!groups.length) return res.status(404).json({ success: false, message: 'Kelompok tidak ditemukan.' });
    if (groups[0].is_system) {
      return res.status(422).json({ success: false, message: 'Kelompok bawaan tidak dapat dihapus.' });
    }

    const assignedUsers = await queryAsync('SELECT COUNT(*) AS total FROM users WHERE menu_klp = ?', [id]);
    const assignedEmployees = await queryAsync('SELECT COUNT(*) AS total FROM pegawai_akses WHERE menu_klp = ?', [id]);
    const totalAssigned = Number(assignedUsers[0]?.total || 0) + Number(assignedEmployees[0]?.total || 0);
    if (totalAssigned > 0) {
      return res.status(409).json({
        success: false,
        message: `Kelompok masih digunakan oleh ${totalAssigned} akun dan tidak dapat dihapus.`,
      });
    }

    await queryAsync('DELETE FROM access_group_permissions WHERE group_id = ?', [id]);
    await queryAsync('DELETE FROM access_groups WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Kelompok berhasil dihapus.' });
  } catch (error) {
    console.error('[ACCESS GROUPS] delete:', error.message);
    return res.status(500).json({ success: false, message: 'Gagal menghapus kelompok.' });
  }
});

module.exports = router;
