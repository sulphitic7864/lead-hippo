"use client";

import { useState } from "react";
import type { PublicLead } from "@/types";

export function OpportunityGallery({
  lead,
  sold,
}: {
  lead: PublicLead;
  sold: boolean;
}) {
  const [selectedImage, setSelectedImage] = useState(
    lead.photos[0]?.url || "",
  );

  return (
    <div>
      <div className="gallery-main">
        {selectedImage ? (
          <img
            id="main-project-image"
            src={selectedImage}
            alt={lead.title}
          />
        ) : (
          <div className="image-placeholder">Project photo</div>
        )}

        <span className="score-badge large">
          <small>HIPPOSCORE</small>
          {lead.hippoScore}
        </span>

        {lead.isNew && !sold && (
          <span className="new-badge">NEW</span>
        )}

        {sold && <span className="sold-badge">SOLD OUT</span>}
      </div>

      {lead.photos.length > 1 && (
        <div className="gallery-thumbs">
          {lead.photos.map((photo) => (
            <button
              type="button"
              key={photo.id}
              className={`gallery-thumbnail-button ${
                selectedImage === photo.url ? "active" : ""
              }`}
              onClick={() => setSelectedImage(photo.url)}
              aria-label={`Show ${lead.title} image`}
            >
              <img
                src={photo.url}
                alt={`${lead.title} detail`}
                className="gallery-thumbnail"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}