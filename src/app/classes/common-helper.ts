import { Injectable } from "@angular/core";

interface Sorting {
    sort_by: string,
    order: string
}

@Injectable({
    providedIn: 'root'
})
export class CommonHelper {
    appliedSorting: Sorting = {
        sort_by: null,
        order: null
    };

    applySorting(sort: Sorting) {
        if (this.appliedSorting.sort_by == null) {
            return JSON.stringify(sort);
        }
        return JSON.stringify(this.appliedSorting);
    }

    getMimeClass(mime) {
        if (!mime || mime === null || mime === undefined) {
            return 'mime mime-file';
        }

        const tempMime = mime.split('/');
        const part1 = tempMime[0];
        const part2 = tempMime[1];

        // Image
        if (part1 === 'image') {
            if (part2.includes('photoshop')) {
                return 'mime mime-photoshop';
            }

            return 'mime mime-image';
        }
        // Audio
        else if (part1 === 'audio') {
            return 'mime mime-audio';
        }
        // Video
        else if (part1 === 'video') {
            return 'mime mime-video';
        }
        // Text
        else if (part1 === 'text') {
            return 'mime mime-file';
        }
        // Applications
        else if (part1 === 'application') {
            // Pdf
            if (part2 === 'pdf') {
                return 'mime mime-pdf';
            }
            // Illustrator
            else if (part2 === 'illustrator') {
                return 'mime mime-illustrator';
            }
            // Zip
            else if (part2 === 'zip' || part2 === 'gzip' || part2.includes('tar') || part2.includes('compressed')) {
                return 'mime mime-zip';
            }
            // PowerPoint
            else if (part2.includes('powerpoint') || part2.includes('presentation')) {
                return 'mime mime-powerpoint';
            }
            // Excel
            else if (part2.includes('excel') || part2.includes('sheet')) {
                return 'mime mime-excel';
            }
            // Word
            else if (part2 === 'msword' || part2 === 'rtf' || part2.includes('document')) {
                return 'mime mime-word';
            }
            // Else
            return 'mime mime-file';
        }
        // Else
        return 'mime mime-file';
    }

    getMimeIcon(mime) {
        if (!mime || mime === null || mime === undefined) {
            return '/assets/icon/mime/file.png';
        }

        const tempMime = mime.split('/');
        const part1 = tempMime[0];
        const part2 = tempMime[1];

        // Image
        if (part1 === 'image') {
            if (part2.includes('photoshop')) {
                return 'mime mime-photoshop';
            }

            return '/assets/icon/mime/image.png';
        }
        // Audio
        else if (part1 === 'audio') {
            return '/assets/icon/mime/audio.png';
        }
        // Video
        else if (part1 === 'video') {
            return '/assets/icon/mime/video.png';
        }
        // Text
        else if (part1 === 'text') {
            return '/assets/icon/mime/file.png';
        }
        // Applications
        else if (part1 === 'application') {
            // Pdf
            if (part2 === 'pdf') {
                return '/assets/icon/mime/pdf.png';
            }
            // Illustrator
            else if (part2 === 'illustrator') {
                return 'mime mime-illustrator';
            }
            // Zip
            else if (part2 === 'zip' || part2 === 'gzip' || part2.includes('tar') || part2.includes('compressed')) {
                return '/assets/icon/mime/zip.png';
            }
            // PowerPoint
            else if (part2.includes('powerpoint') || part2.includes('presentation')) {
                return '/assets/icon/mime/powerpoint.png';
            }
            // Excel
            else if (part2.includes('excel') || part2.includes('sheet')) {
                return '/assets/icon/mime/excel.png';
            }
            // Word
            else if (part2 === 'msword' || part2 === 'rtf' || part2.includes('document')) {
                return '/assets/icon/mime/word.png';
            }
            // Else
            return '/assets/icon/mime/file.png';
        }
        // Else
        return '/assets/icon/mime/file.png';
    }
}
