import * as React from "react"

interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: number
}

export function Logo({ size = 24, className = "", alt = "Logo Konawe Selatan", ...props }: LogoProps) {
  return (
    <img
      src="/logo_konsel.png"
      alt={alt}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={`shrink-0 object-contain ${className}`}
      {...props}
    />
  )
}
