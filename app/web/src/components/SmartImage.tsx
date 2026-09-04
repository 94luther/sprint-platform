import { useRef, useState, useEffect, type CSSProperties } from 'react'

interface SmartImageProps {
  src: string
  alt: string
  className?: string
  style?: CSSProperties
  /** Above-the-fold images (heroes, first cards) load eagerly for instant paint. */
  eager?: boolean
}

// One skeleton-to-photo swap used everywhere an image appears (merchant
// hero cards, menu item photos, category chips): same shimmer timing, same
// fade-in, so the whole app loads images with one consistent hand instead
// of every screen inventing its own placeholder. Always object-fit: cover,
// sized by the parent, so nothing ever stretches.
export default function SmartImage({ src, alt, className = '', style, eager = false }: SmartImageProps) {
  const [loaded, setLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  // A cached image can be complete before React attaches onLoad; without this
  // check it would sit behind the skeleton forever.
  useEffect(() => {
    const el = imgRef.current
    if (el && el.complete && el.naturalWidth > 0) setLoaded(true)
  }, [src])

  return (
    <div className={`smart-image ${className}`} style={style}>
      {!loaded && <div className="skeleton smart-image-skeleton" />}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        className={`smart-image-img${loaded ? ' loaded' : ''}`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  )
}
