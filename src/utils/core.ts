import * as fs from 'fs';
import * as path from "path";
import * as dayjs from "dayjs";
import * as XLSX from 'xlsx'

export function log(...args) {
  const now = dayjs();
  console.log(`${now.format('YYYY/MM/DD HH:mm:ss')}:`, ...args)
}

export async function sleep(ms: number) {
  log(`==== Waiting ${Math.round(ms / 1000)}s ====`);
  return new Promise(rs => setTimeout(rs, ms));
}


export function getAbsolutePathByFileName(fileName: string, folder = './media') {
  const files = fs.readdirSync(folder);
  // console.log({files})
  const mediaList = files.filter(f => f.includes(fileName));
  if (mediaList.length == 0) return [];

  return resolveMediaList(folder, mediaList);
}

function resolveMediaList(folder: string, mediaList: string[]) {
  return mediaList.map(name => path.resolve(folder, name));
}

export function toSnakeCase(str: string) {
  return str
    .replace(/Đ/g, "D")
    .replace(/đ/g, "d")
    .normalize("NFD")                       // tách dấu
    .replace(/[\u0300-\u036f]/g, "")        // xoá dấu
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")            // chuyển khoảng trắng và ký tự đặc biệt thành _
    .replace(/^_+|_+$/g, "");               // xoá _ thừa
}

export function convertToXlsx(data: { [k in string]: any }[], filePath: string) {
  // 1. Chuyển dữ liệu sang worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // 2. Tạo workbook và thêm worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  //35. Ghi ra file Excel
  XLSX.writeFile(workbook, filePath);

  console.log(`✅ Xuất file ${filePath} thành công`);
}


/**
* Tìm file trong 1 folder (1 tầng)
* @param {string} folderPath - đường dẫn folder
* @param {string} keyword - từ khóa trong tên file
*/
export function searchFilesInFolder(folderPath: string, keyword: string) {
  if (!fs.existsSync(folderPath)) {
    console.error("Folder không tồn tại:", folderPath);
    return;
  }

  let files = fs.readdirSync(folderPath, { withFileTypes: true });
  files = files.filter(item => item.isFile()); // chỉ lấy file

  for (const item of files) {
    if (item.name.includes(keyword)) { // tên file chứa keyword
      return path.join(folderPath, item.name);
    }
  }

  return null;
}

// ===== CÁCH DÙNG =====
const folderPath = "/Users/yourname/Documents/data"; // folder truyền vào
const keyword = "report"; // cụm từ cần tìm
