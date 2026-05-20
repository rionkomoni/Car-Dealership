import { useCallback, useEffect, useState } from "react";

export default function CarGalleryViewer({ imageUrls, carName }) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const count = imageUrls.length;
  const mainSrc = count > 0 ? imageUrls[photoIndex] : null;

  const goPrev = useCallback(() => {
    if (count <= 1) return;
    setPhotoIndex((i) => (i - 1 + count) % count);
  }, [count]);

  const goNext = useCallback(() => {
    if (count <= 1) return;
    setPhotoIndex((i) => (i + 1) % count);
  }, [count]);

  useEffect(() => {
    setPhotoIndex(0);
  }, [imageUrls]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen, goPrev, goNext]);

  return (
    <div className="car-gallery-viewer">
      <div className="car-gallery-main">
        {mainSrc ? (
          <>
            <button
              type="button"
              className="car-gallery-main-btn"
              onClick={() => setLightboxOpen(true)}
              aria-label="Hap foto në ekran të plotë"
            >
              <img
                src={mainSrc}
                alt={`${carName} — pamja ${photoIndex + 1}`}
                className="car-detail-image car-gallery-main-img"
              />
            </button>
            {count > 1 ? (
              <>
                <button
                  type="button"
                  className="car-gallery-nav car-gallery-nav--prev"
                  onClick={goPrev}
                  aria-label="Foto e mëparshme"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="car-gallery-nav car-gallery-nav--next"
                  onClick={goNext}
                  aria-label="Foto tjetër"
                >
                  ›
                </button>
                <span className="car-gallery-counter">
                  {photoIndex + 1} / {count}
                </span>
              </>
            ) : null}
          </>
        ) : (
          <div className="car-detail-image car-detail-image--placeholder">
            Nuk ka foto të ngarkuar
          </div>
        )}
      </div>

      {count > 1 ? (
        <div className="car-gallery-thumbs" role="tablist" aria-label="Pamje të veturës">
          {imageUrls.map((url, i) => (
            <button
              key={`${url}-${i}`}
              type="button"
              role="tab"
              aria-selected={i === photoIndex}
              className={`car-gallery-thumb${i === photoIndex ? " is-active" : ""}`}
              onClick={() => setPhotoIndex(i)}
            >
              <img src={url} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      ) : null}

      <p className="car-gallery-hint muted small">
        {count > 1
          ? "Shigjetat, miniaturat ose klikoni foton për ekran të plotë."
          : "Klikoni foton për ta zmadhuar."}
      </p>

      {lightboxOpen && mainSrc ? (
        <div
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Galeri — ${carName}`}
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            className="gallery-lightbox-close"
            onClick={() => setLightboxOpen(false)}
            aria-label="Mbyll"
          >
            ×
          </button>
          {count > 1 ? (
            <>
              <button
                type="button"
                className="gallery-lightbox-nav gallery-lightbox-nav--prev"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                aria-label="Para"
              >
                ‹
              </button>
              <button
                type="button"
                className="gallery-lightbox-nav gallery-lightbox-nav--next"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                aria-label="Tjetra"
              >
                ›
              </button>
            </>
          ) : null}
          <img
            src={mainSrc}
            alt={carName}
            className="gallery-lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="gallery-lightbox-caption">
            {photoIndex + 1} / {count}
          </p>
        </div>
      ) : null}
    </div>
  );
}
