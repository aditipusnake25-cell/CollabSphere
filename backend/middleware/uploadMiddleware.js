import multer from "multer"
import { randomUUID } from "node:crypto"
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadDir = path.resolve(__dirname, '../uploads')
fs.mkdirSync(uploadDir , {recursive:true})

const storage = multer.diskStorage({
    destination:(_req,_file , cb)=>{
        cb(null,uploadDir)
    },
  filename: (req, file, cb) => {
  const safeName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, "_")
  cb(null, `${randomUUID()}-${safeName}`);
}
})

const allowedExtensions=[".js",".jsx",".py",".java",".html",".css",".json",".md",".txt",".pdf",".png",".jpg",".jpeg",".gif",".webp",".zip"]
const upload = multer({
    storage,limits:{
        fileSize:5*1024*1024
    },
    fileFilter:(_req,file,cb)=>{
        const ext =path.extname(file.originalname).toLowerCase()
        if(allowedExtensions.includes(ext)){
            return cb(null,true)
        }
        const error = new Error("This file type is not supported!")
        error.status = 400
        cb(error)
    }
})
export default upload