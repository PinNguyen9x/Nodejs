import swaggerJsdoc from 'swagger-jsdoc'
import { envConfig } from '../constants/config'
import path from 'path'
import fs from 'fs'
import yaml from 'js-yaml'

// Define types for YAML content
interface PathContent {
  [key: string]: any
}

// Load YAML files
const loadYamlFile = (filePath: string): PathContent => {
  const fileContents = fs.readFileSync(filePath, 'utf8')
  return yaml.load(fileContents) as PathContent
}

// Load components and paths
const componentsPath = path.join(__dirname, 'components.yaml')
const components = loadYamlFile(componentsPath)

const pathsDir = path.join(__dirname, 'paths')
const pathFiles = fs.readdirSync(pathsDir)
const paths = pathFiles.reduce<PathContent>((acc, file) => {
  const pathContent = loadYamlFile(path.join(pathsDir, file))
  return { ...acc, ...pathContent }
}, {})

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Social Media API',
      version: '1.0.0',
      description: 'API documentation for Social Media project'
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === 'production'
            ? 'https://twitter-navy-seven.vercel.app'
            : `http://localhost:${envConfig.port}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    ...components, // Include components
    paths: paths // Include paths
  },
  apis: [] // We're loading YAML files manually now
}

export const specs = swaggerJsdoc(options)
