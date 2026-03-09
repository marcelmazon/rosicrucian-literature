// ******************************************************************
// * This script tests parragraph correspondence for each text 
// * with its original source text that it was translated from
// ******************************************************************

import fs from "fs";
import chalk from 'chalk';
import matter from 'gray-matter'

interface ChapterLinesCount {
	chapter_id: string;
	count: number;
}

// console.log(chalk.blue('Hello world!'));
// console.log(chalk.red.bold.underline('This is a serious error!'));
// console.log(chalk.bgGreen.black(' Success! '));

// TODO: define chalk colors for easy read error output
// TODO: Find better format for error output [] (maybe), or tables (maybe)
// TODO: Before printing book, print language
	// TODO: Print book out first before printing errors
		// - if no errors, then print out book title in blue/green with checkmark or something
			// TODO: Maybe use indentations or --- for the above to visually distinguish
			// TODO: array of languages to search through
// TODO: Add error handling, account for src_book not found


// TODO: Convert massively to .txt and .pdf, also in rosacrux.net project, download as standalone html, 
	//  with <style> css to minimize external folders for images if possible

const log = console.log
const book_err = chalk.bold.red
const chap_err = chalk.red
const chap_name = chalk.dim
const num_color = chalk.cyan
const orange = chalk.hex('#FFA500')

const langs = [
	// Romance

	// Germanic

	// Slavic
	'bg'
]

for (const lang of langs)
{
	read_lang_docs(lang)
}

function read_lang_docs(lang: string)
{
	const literature = fs.readdirSync(`../${lang}`, { withFileTypes: true, recursive: true })
	const sorted     = sort_alphabetically(literature)
	const md_files   = sorted.filter(file => file.name.endsWith('.md') )  // Get all .md files
	const files      = md_files.filter(file => file.name !== "README.md") // Get all files that aren't a README

	for (const file of files)
	{
		// Translated file to be compared
		const trans_file = fs.readFileSync(`../${lang}/heindel-max/${file.name}`, 'utf8')
		// Data for getting original src file
		const { data } = matter(trans_file)
		const orln = data.original_language
		const catg = file.parentPath.split('/').slice(1).at(1)
		const srcf = data.original_source_file
		// Original language source file path =>
		const orip = `../${orln}/${catg}/${srcf}`
		const src_file = fs.readFileSync(orip, 'utf8')
		// .md Contents of translated and source files
		const trans_file_content = matter(trans_file).content
		const src_file_content   = matter(src_file).content

		// Split by newlines (handles both Windows \r\n and Unix \n)
		const trans_lines = trans_file_content.split(/\r?\n/);
		const src_lines   = src_file_content.split(/\r?\n/);

		const trans_lines_count: ChapterLinesCount[] = read_doc_line_by_line(trans_lines)
		const src_lines_count: ChapterLinesCount[]   = read_doc_line_by_line(src_lines)

		print_book_errors(src_lines_count, trans_lines_count)
	}
}

function read_doc_line_by_line(doc: string[])
{
	// Initial variables
	const array2push2: ChapterLinesCount[] = []
	let total_count   = 0
	let current_head  = ""
	let current_count = 0
	let in_pre        = false
	let met_first_h1  = false

	for (const line of doc)
	{
		if (!is_header && current_count === 0)
			continue

		if (is_header(line)) 
		{
			if (met_first_h1) 
			{
				array2push2.push 
				({
					chapter_id: current_head, 
					count: current_count
				})
			}

			met_first_h1  = true // met first header
			current_count = 0    // reset count
			current_head  = line // new head
		}

		if (total_count === doc.length - 1)
		{
			array2push2.push 
			({
				chapter_id: current_head, 
				count: current_count
			})
		}
		
		// If haven't gotten to first head yet, skip
		if (current_head === "") continue 
		// translator/editor notes not in original
		if (line.startsWith("() - ")) {
			current_count-- // bc "() -" + \n add 2 lines total
			continue
		}
		// ╭► Count each <pre> block as just one line, in case
		// different translations format poems differently
		// Note: this <pre> if clause must come before </pre> if clause
		// in order for the algorithm to work because of "```"
		if (line.startsWith("<pre") || (line.startsWith("```") && !in_pre)) {
			in_pre = true
			continue
		}
		if (line.startsWith("</pre") || (line.startsWith("```") && in_pre))
			in_pre = false
		if (in_pre) continue
		
		current_count++
		total_count++
	}

	return array2push2
}

// Returns true if line is a header, false otherwise
function is_header(line: string): boolean
{
	if (line.startsWith("###")) return true
	if (line.startsWith("<h1")) return true
	if (line.startsWith("<h2")) return true

	return false
}

// Gets header title from line, so from
// '### <h3 id="lol">Lol</h3>' -> we get -> 'Lol'
function get_header_title(line: string): string
{
	if (line.includes("<h") && !line.includes("<hr"))
	{
		const start = line.indexOf('>') + 1; 
		const end = line.indexOf('</'); 
		return line.substring(start, end); // header_title
	}
	else // If missing / bad format (### Example Title...)
	{
		const start = line.indexOf(' ') + 1; 
		const end = line.length - 1; 
		return line.substring(start, end); // header_title ()
	}
}

// Sorts fs.Dirent<string> objects alphabetically by their name
function sort_alphabetically(literature: fs.Dirent<string>[]) {
	return literature.sort((a, b) => { 
		return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
	});
}

/**
 * 
 * @param src_lines source book lines count
 * @param trans_lines translated book lines count
 */
function print_book_errors(src_lines: ChapterLinesCount[], trans_lines: ChapterLinesCount[])
{
	src_lines.forEach((src_chapter, index) => {
		if (trans_lines[index] === undefined) return

		if (src_chapter.count !== trans_lines[index].count)
		{
			// Get chapter titles (easier to read than whole line)
			const src_chapter_title = get_header_title(src_chapter.chapter_id)
			const trans_chapter_title = get_header_title(trans_lines[index].chapter_id)
			// Print error
			log(book_err(`[Error]:`))
			log(`${src_chapter_title} - ${chalk.cyan.bold(`lines (${src_chapter.count})`)}`)
			log(`${chap_name("does not correspond to")}`)
			log(`${trans_chapter_title} - ${chalk.cyan.bold(`lines (${trans_lines[index].count})`)}\n`)
		}
	})
}