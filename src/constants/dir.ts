import path from 'path'
import os from 'os'

// Use tmp directory for serverless environment
const ROOT_DIR = process.env.VERCEL ? os.tmpdir() : '.'

export const UPLOAD_IMAGE_TEMP_DIR = path.resolve(ROOT_DIR, 'uploads/images/temp')
export const UPLOAD_IMAGE_DIR = path.resolve(ROOT_DIR, 'uploads/images')
export const UPLOAD_VIDEO_TEMP_DIR = path.resolve(ROOT_DIR, 'uploads/videos/temp')
export const UPLOAD_VIDEO_DIR = path.resolve(ROOT_DIR, 'uploads/videos')
