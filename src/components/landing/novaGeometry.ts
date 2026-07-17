// Single source of truth for Nova's physical dimensions, shared between
// NovaMascot.tsx (renders her, at this size) and NovaController.tsx (does
// tile-clearance math against her actual size). These used to be hardcoded
// independently in both files — when the model was swapped from a
// primitive-built body to a real GLB, NovaMascot.tsx's dimensions changed
// but NovaController.tsx's clearance constants didn't, silently
// invalidating the tile-overlap fix without either file showing an error.
// Splitting the raw values out here means a future model swap only needs
// updating in one place, and the two files can't drift apart again.
//
// Raw values are the GLB's native bounding box (Tripo3D's default export
// units: bboxMin ≈ [-0.058, -0.125, -0.100], bboxMax ≈ [0.058, 0.125, 0.100]).
export const MODEL_SCALE = 4.5;
export const MODEL_HALF_WIDTH = 0.058 * MODEL_SCALE;
export const MODEL_HALF_HEIGHT = 0.125 * MODEL_SCALE;
export const MODEL_HALF_DEPTH = 0.1 * MODEL_SCALE;
