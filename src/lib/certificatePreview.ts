export interface CertificatePreviewData {
	name: string;
	ceTitle: string;
	ceDate: Date | string;
}

function formatDate(date: Date | string): string {
	const d = date instanceof Date ? date : new Date(date);
	// Use a simple readable format
	return d.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
}

export function drawCertificatePreview(
	canvas: HTMLCanvasElement,
	data: CertificatePreviewData,
): string {
	const ctx = canvas.getContext('2d');
	if (!ctx) {
		throw new Error('Unable to get 2D context');
	}

	// Simple placeholder design - will be replaced with final artwork later
	const width = canvas.width || 800;
	const height = canvas.height || 600;

	ctx.fillStyle = '#ffffff';
	ctx.fillRect(0, 0, width, height);

	// Border
	ctx.strokeStyle = '#333333';
	ctx.lineWidth = 4;
	ctx.strokeRect(20, 20, width - 40, height - 40);

	// Inner border
	ctx.strokeStyle = '#666666';
	ctx.lineWidth = 2;
	ctx.strokeRect(30, 30, width - 60, height - 60);

	// Title
	ctx.fillStyle = '#111111';
	ctx.font = 'bold 32px serif';
	ctx.textAlign = 'center';
	ctx.fillText('CERTIFICATE OF PARTICIPATION', width / 2, 120);

	ctx.font = '20px serif';
	ctx.fillText('This is to certify that', width / 2, 200);

	// Name
	ctx.font = 'bold 40px serif';
	ctx.fillStyle = '#000000';
	ctx.fillText(data.name || '________________________', width / 2, 280);

	// Body text
	ctx.font = '18px serif';
	ctx.fillStyle = '#111111';
	ctx.fillText('has participated in the Continuing Education session:', width / 2, 340);

	// CE Title
	ctx.font = 'italic 24px serif';
	const ceTitle = data.ceTitle || '';
	// Wrap text if too long
	const maxWidth = width - 100;
	const words = ceTitle.split(' ');
	let line = '';
	let y = 400;
	for (let i = 0; i < words.length; i++) {
		const testLine = line + words[i] + ' ';
		const metrics = ctx.measureText(testLine);
		if (metrics.width > maxWidth && i > 0) {
			ctx.fillText(line.trim(), width / 2, y);
			line = words[i] + ' ';
			y += 30;
		} else {
			line = testLine;
		}
	}
	ctx.fillText(line.trim(), width / 2, y);

	// Date
	ctx.font = '18px serif';
	ctx.fillText(`Held on ${formatDate(data.ceDate)}`, width / 2, y + 60);

	// Footer
	ctx.font = '16px serif';
	ctx.fillText('Drug and Toxicology Information Service (DaTIS)', width / 2, height - 80);

	// Watermark
	ctx.save();
	ctx.globalAlpha = 0.15;
	ctx.fillStyle = '#ff0000';
	ctx.font = 'bold 80px sans-serif';
	ctx.textAlign = 'center';
	ctx.translate(width / 2, height / 2);
	ctx.rotate(-Math.PI / 4);
	ctx.fillText('PREVIEW', 0, 0);
	ctx.restore();

	return canvas.toDataURL('image/png');
}
