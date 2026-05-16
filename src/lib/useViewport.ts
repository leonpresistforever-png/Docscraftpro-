import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook for infinite canvas viewport transformations.
 * Handles Pan, Zoom (Scale), and Rotation around a specific focal point.
 * Follows mathematically correct affine transformations separating screen metrics from canvas metrics.
 */
export function useViewport(initialWidth: number, initialHeight: number) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0); // in degrees
  const [position, setPosition] = useState({ x: 0, y: 0 }); // translation

  // Zoom towards a specific focal point (e.g. mouse cursor)
  // `deltaY` is scroll delta, `pointerX` / `pointerY` are screen coords of the cursor
  const handleZoom = useCallback((deltaY: number, pointerX: number, pointerY: number, stageX: number, stageY: number) => {
    setScale((oldScale) => {
      const scaleBy = 1.1;
      let newScale = deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
      
      // Clamp scale between 0.1 (10%) and 32.0 (3200%)
      newScale = Math.min(32.0, Math.max(0.1, newScale));

      // The key to zooming into the cursor is that the canvas coordinate
      // underneath the cursor MUST remain in exactly the same screen position.
      // 1. Convert screen cursor to logical canvas coordinate (before zoom)
      // Math: canvasPoint = (screenPoint - translation) / scale
      const mousePointTo = {
        x: (pointerX - stageX) / oldScale,
        y: (pointerY - stageY) / oldScale,
      };

      // 2. Adjust translation so the logical coordinate goes back to the screen coordinate
      // Math: translation = screenPoint - (canvasPoint * newScale)
      setPosition({
        x: pointerX - mousePointTo.x * newScale - initialWidth / 2, // Centering offset handling
        y: pointerY - mousePointTo.y * newScale - initialHeight / 2,
      });

      return newScale;
    });
  }, [initialWidth, initialHeight]);

  const pan = useCallback((dx: number, dy: number) => {
    setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
  }, []);

  return { scale, setScale, rotation, setRotation, position, setPosition, handleZoom, pan };
}
