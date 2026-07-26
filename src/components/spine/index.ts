// spine/index.ts — barrel for the CORE spine library (S3.1).
// Optional modules (S3.3) live in ./modules/, ONE FILE + co-located CSS per module,
// and are IMPORTED DIRECTLY, never re-exported here — a barrel re-export would pull
// every module's CSS into every site. A site that doesn't enable a module bundles
// neither its JS nor its CSS. Realised: map, hours, video (VideoFacade), gallery
// (GalleryGrid + Lightbox + filter), marquee, audio (AudioPlayer), deco (DecoStar/
// Grain/ZigZag/TiltFrame/CutBadge/PulsePill). Switched on per the site charter.
// AI Smith ships none of them — it is a content-light marketing site.
export * from "./primitives";
export * from "./cards";
export * from "./chrome";
export * from "./forms";
export * from "./legal";    // CORE: PrivacyNotice (S7.4)
