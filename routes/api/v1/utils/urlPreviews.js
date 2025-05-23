import fetch from 'node-fetch';
import { parse } from 'node-html-parser';

const escapeHTML = str => String(str).replace(/[&<>'"]/g, 
    tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[tag]));

async function getURLPreview(url){
    try {
        const response = await fetch(url, { //handle ECONNRESET
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90 Safari/537.36'
            },
            timeout: 5000
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch the URL');
        }

        const htmlText = await response.text();
        const root = parse(htmlText);

        const metaTags = root.querySelectorAll("meta");
        const data = {
            url: url,
            title: '',
            image: '',
            description: '',
            site_name: '',
        };

        for (let i = 0; i < metaTags.length; i++) {
            const tag = metaTags[i];
            const property = tag.getAttribute('property');
            const content = tag.getAttribute('content');
            const name = tag.getAttribute('name');

            if (property === 'og:url') {
                data.url = content;
            } else if (property === 'og:title') {
                data.title = content;
            } else if (property === 'og:image') {
                data.image = content;
            } else if (property === 'og:description') {
                data.description = content;
            } else if (property === 'og:site_name') {
                data.site_name = content;
            }
        }

        if (!data.title) {
            const titleTag = root.querySelector('title');
            data.title = titleTag ? titleTag.text : url;
        }

        let previewHtml = `<div style="max-width: 300px; border: solid 1px; padding: 3px; text-align: center;">`;
        previewHtml += `<a href="${data.url}">`;

        if (data.site_name) {
            previewHtml += `<p> Site: ${data.site_name}</p>`;
        }
        
        previewHtml += `<p><strong>${data.title}</strong></p>`;

        if (data.image) {
            previewHtml += `<img src="${escapeHTML(data.image)}" style="max-height: 200px; max-width: 270px;">`;
        }

        previewHtml += `</a>`;

        if (data.description) {
            previewHtml += `<p>${escapeHTML(data.description)}</p>`;
        }

        previewHtml += `</div>`;

        return previewHtml;
    } catch (error) {
        return `<p style="color: red;"><strong>Error:</strong> ${escapeHTML(error.message)}</p>`;
    }
}

export default getURLPreview;