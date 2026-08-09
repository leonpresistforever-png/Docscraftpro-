import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { runSEOAudit } from './seoAudit';

describe('runSEOAudit', () => {
    let consoleErrorMock: any;
    let consoleWarnMock: any;
    let consoleLogMock: any;
    let consoleGroupMock: any;
    let consoleGroupEndMock: any;

    beforeEach(() => {
        consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});
        consoleWarnMock = vi.spyOn(console, 'warn').mockImplementation(() => {});
        consoleLogMock = vi.spyOn(console, 'log').mockImplementation(() => {});
        consoleGroupMock = vi.spyOn(console, 'group').mockImplementation(() => {});
        consoleGroupEndMock = vi.spyOn(console, 'groupEnd').mockImplementation(() => {});

        // Clear the document body and head
        document.head.innerHTML = '';
        document.body.innerHTML = '';
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should log a success message when all SEO tags are valid', () => {
        document.head.innerHTML = `
            <meta name="description" content="This is a valid meta description that is definitely longer than fifty characters to avoid warnings." />
            <title>Valid Title</title>
            <link rel="canonical" href="https://example.com" />
        `;

        runSEOAudit();

        expect(consoleLogMock).toHaveBeenCalledWith('✅ All crucial SEO tags look good for the current route.');
        expect(consoleErrorMock).not.toHaveBeenCalled();
        expect(consoleWarnMock).not.toHaveBeenCalled();
    });

    it('should report an error when meta description is missing', () => {
        document.head.innerHTML = `
            <title>Valid Title</title>
            <link rel="canonical" href="https://example.com" />
        `;

        runSEOAudit();

        expect(consoleErrorMock).toHaveBeenCalledWith(
            '❌ SEO Errors:',
            expect.arrayContaining(['Missing meta description tag (<meta name="description" />)'])
        );
    });

    it('should report a warning when meta description content is empty', () => {
        document.head.innerHTML = `
            <meta name="description" content="" />
            <title>Valid Title</title>
            <link rel="canonical" href="https://example.com" />
        `;

        runSEOAudit();

        expect(consoleWarnMock).toHaveBeenCalledWith(
            '⚠️ SEO Warnings:',
            expect.arrayContaining(['Meta description tag is present but content is empty'])
        );
    });

    it('should report a warning when meta description is too short', () => {
        document.head.innerHTML = `
            <meta name="description" content="Too short" />
            <title>Valid Title</title>
            <link rel="canonical" href="https://example.com" />
        `;

        runSEOAudit();

        expect(consoleWarnMock).toHaveBeenCalledWith(
            '⚠️ SEO Warnings:',
            expect.arrayContaining(['Meta description might be too short (under 50 characters)'])
        );
    });

    it('should report a warning when meta description is too long', () => {
        const longDescription = 'A'.repeat(161);
        document.head.innerHTML = `
            <meta name="description" content="${longDescription}" />
            <title>Valid Title</title>
            <link rel="canonical" href="https://example.com" />
        `;

        runSEOAudit();

        expect(consoleWarnMock).toHaveBeenCalledWith(
            '⚠️ SEO Warnings:',
            expect.arrayContaining(['Meta description might be too long (over 160 characters)'])
        );
    });

    it('should report an error when title is missing', () => {
        document.head.innerHTML = `
            <meta name="description" content="This is a valid meta description that is definitely longer than fifty characters to avoid warnings." />
            <link rel="canonical" href="https://example.com" />
        `;

        runSEOAudit();

        expect(consoleErrorMock).toHaveBeenCalledWith(
            '❌ SEO Errors:',
            expect.arrayContaining(['Missing title tag (<title>)'])
        );
    });

    it('should report an error when duplicate titles are found', () => {
        document.head.innerHTML = `
            <meta name="description" content="This is a valid meta description that is definitely longer than fifty characters to avoid warnings." />
            <title>Title 1</title>
            <title>Title 2</title>
            <link rel="canonical" href="https://example.com" />
        `;

        runSEOAudit();

        expect(consoleErrorMock).toHaveBeenCalledWith(
            '❌ SEO Errors:',
            expect.arrayContaining(['Duplicate title tags found (2 tags)'])
        );
    });

    it('should report a warning when canonical link is missing', () => {
        document.head.innerHTML = `
            <meta name="description" content="This is a valid meta description that is definitely longer than fifty characters to avoid warnings." />
            <title>Valid Title</title>
        `;

        runSEOAudit();

        expect(consoleWarnMock).toHaveBeenCalledWith(
            '⚠️ SEO Warnings:',
            expect.arrayContaining(['Missing canonical link (<link rel="canonical" />)'])
        );
    });

    it('should report an error when canonical link href is empty', () => {
        document.head.innerHTML = `
            <meta name="description" content="This is a valid meta description that is definitely longer than fifty characters to avoid warnings." />
            <title>Valid Title</title>
            <link rel="canonical" href="" />
        `;

        runSEOAudit();

        expect(consoleErrorMock).toHaveBeenCalledWith(
            '❌ SEO Errors:',
            expect.arrayContaining(['Canonical link is present but href is empty'])
        );
    });
});
