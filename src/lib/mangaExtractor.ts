export async function extractPanelsFromImage(dataUrl: string): Promise<any> {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const tempCanvas = document.createElement('canvas');
            const W = 400; // process at lower res for speed
            const H = Math.round((img.height / img.width) * W);
            tempCanvas.width = W;
            tempCanvas.height = H;
            const ctx = tempCanvas.getContext('2d')!;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, W, H);
            ctx.drawImage(img, 0, 0, W, H);
            
            const imageData = ctx.getImageData(0, 0, W, H);
            const data = imageData.data;
            const visited = new Uint8Array(W * H);
            const regions: { minX: number, minY: number, maxX: number, maxY: number, area: number }[] = [];
            
            // A threshold for whitish pixels (drawn lines are dark)
            const isWhiteIsh = (idx: number) => ((data[idx] + data[idx+1] + data[idx+2]) / 3) > 120;

            for (let y = 0; y < H; y++) {
                for (let x = 0; x < W; x++) {
                    const idx = (y * W + x);
                    if (!visited[idx] && isWhiteIsh(idx * 4)) {
                        // Flood fill
                        let minX = x, minY = y, maxX = x, maxY = y;
                        let area = 0;
                        const queue = [{cx: x, cy: y}];
                        visited[idx] = 1;
                        
                        while(queue.length > 0) {
                            const p = queue.pop()!;
                            area++;
                            if (p.cx < minX) minX = p.cx;
                            if (p.cx > maxX) maxX = p.cx;
                            if (p.cy < minY) minY = p.cy;
                            if (p.cy > maxY) maxY = p.cy;
                            
                            const neighbors = [
                                {cx: p.cx + 1, cy: p.cy},
                                {cx: p.cx - 1, cy: p.cy},
                                {cx: p.cx, cy: p.cy + 1},
                                {cx: p.cx, cy: p.cy - 1}
                            ];
                            for (const n of neighbors) {
                                if (n.cx >= 0 && n.cx < W && n.cy >= 0 && n.cy < H) {
                                    const nIdx = n.cy * W + n.cx;
                                    if (!visited[nIdx]) {
                                        visited[nIdx] = 1;
                                        if (isWhiteIsh(nIdx * 4)) {
                                            queue.push(n);
                                        }
                                    }
                                }
                            }
                        }
                        
                        // Keep regions > 2% of the image (some small panels are okay)
                        if (area > (W * H * 0.02)) {
                            regions.push({ minX, minY, maxX, maxY, area });
                        }
                    }
                }
            }
            
            if (regions.length === 0) {
                resolve(null);
                return;
            }

            // Snap coordinates to clean up misalignments
            const snapThresholdX = W * 0.03; 
            const snapThresholdY = H * 0.03;
            
            const xs = new Set<number>();
            const ys = new Set<number>();
            
            xs.add(0); xs.add(W);
            ys.add(0); ys.add(H);
            
            regions.forEach(r => {
                xs.add(r.minX); xs.add(r.maxX);
                ys.add(r.minY); ys.add(r.maxY);
            });
            
            const sortedX = Array.from(xs).sort((a,b)=>a-b);
            const sortedY = Array.from(ys).sort((a,b)=>a-b);
            
            const snap = (val: number, arr: number[], threshold: number) => {
                const close = arr.find(v => Math.abs(v - val) < threshold);
                return close !== undefined ? close : val;
            };

            const snappedRegions = regions.map(r => {
                // Snap edges to grid lines
                const minX = snap(r.minX, sortedX, snapThresholdX);
                const maxX = snap(r.maxX, sortedX, snapThresholdX);
                const minY = snap(r.minY, sortedY, snapThresholdY);
                const maxY = snap(r.maxY, sortedY, snapThresholdY);
                return { ...r, minX, maxX, minY, maxY };
            });

            const panels = snappedRegions.map((r, i) => {
                // Remove borders logic: when we calculate width/height, we leave a small fixed gap
                // Let's rely on MangaPanel's wrapper to add a background, we just output pure % sizes.
                const px = Math.max(0, (r.minX / W) * 100);
                const py = Math.max(0, (r.minY / H) * 100);
                const pw = Math.min(100 - px, ((r.maxX - r.minX) / W) * 100);
                const ph = Math.min(100 - py, ((r.maxY - r.minY) / H) * 100);
                return {
                    id: `custom-p${i}`,
                    absolute: true,
                    x: px, y: py, w: pw, h: ph,
                    clipPath: 'none'
                };
            });

            resolve({
                type: 'custom_absolute',
                panels: panels
            });
        };
        img.onerror = () => resolve(null);
        img.src = dataUrl;
    });
}
