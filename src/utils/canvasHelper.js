const { createCanvas, loadImage } = require('canvas');

class CanvasHelper {
    static async generateWarImage(alliance, opponent, points, oppPoints, timeLeft) {
        const width = 800;
        const height = 400;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = '#1a1a1b';
        ctx.fillRect(0, 0, width, height);

        // Header
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('ESTADO DE GUERRA', width / 2, 50);

        // Alliance 1
        ctx.fillStyle = '#0099ff';
        ctx.font = 'bold 40px Arial';
        ctx.fillText(alliance.substring(0, 15), 200, 150);
        ctx.font = 'bold 60px Arial';
        ctx.fillText(points.toString(), 200, 250);

        // VS
        ctx.fillStyle = '#ff4500';
        ctx.font = 'bold 40px Arial';
        ctx.fillText('VS', width / 2, 200);

        // Alliance 2
        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 40px Arial';
        ctx.fillText(opponent.substring(0, 15), 600, 150);
        ctx.font = 'bold 60px Arial';
        ctx.fillText(oppPoints.toString(), 600, 250);

        // Time Left
        ctx.fillStyle = '#ffd700';
        ctx.font = '25px Arial';
        ctx.fillText(`Tiempo Restante: ${timeLeft}`, width / 2, 350);

        return canvas.toBuffer();
    }
}

module.exports = CanvasHelper;
