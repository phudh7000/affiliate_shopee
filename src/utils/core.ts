import * as fs from 'fs';
import * as path from "path";
import * as dayjs from "dayjs";

export function log(...args) {
  const now = dayjs();
  console.log(`${now.format('YYYY/MM/DD HH:mm:ss')}:`, ...args)
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