import * as fs from 'fs';
import * as path from 'path';

// Must call script from root directory for it to find TARGET_DIR
const TARGET_DIR: string = './ro/pamphlets';
const PAMPHLET_NAME: string = 'brosura'

/**
 * Creates 54 markdown files with sequential naming.
 */
function generateFiles(): void {
    try 
	{
        for (let i = 1; i <= 54; i++) 
		{
            // Formats number to 2 digits (e.g., "01", "02")
            const fileNum: string = i.toString().padStart(2, '0');
            const fileName: string = `${PAMPHLET_NAME}-${fileNum}-.md`;
            const filePath: string = path.join(TARGET_DIR, fileName);

            fs.writeFileSync(filePath, ''); 
        }

        console.log(`Success: 54 files created in ${TARGET_DIR}`);
    } 
	catch (error) 
	{
        console.error('An error occurred while creating files:', error);
    }
}

generateFiles();