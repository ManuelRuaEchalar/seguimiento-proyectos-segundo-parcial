import {
  Body,
  Controller,
  Post,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  Param,
  Res,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import path, { extname } from 'path';
import { ObservacionService } from './observacion.service';
import { File as MulterFile } from 'multer';
import { Response } from 'express';
import * as fs from 'fs';

@Controller('observacion')
export class ObservacionController {
  constructor(private readonly observacionService: ObservacionService) { }

  // =====================
  // 📌 Obtener observaciones de un documento
  // =====================
  @Post('get-obs')
  async getObservaciones(@Body('codigoDoc', ParseIntPipe) codigoDoc: number) {
    console.log('enviando observaciones para documento con id:', codigoDoc);
    return this.observacionService.getObservaciones(codigoDoc);
  }

  @Post('get-obs-area')
  async getObservacionesArea(@Body('codigoDoc', ParseIntPipe) codigoDoc: number) {
    console.log('Enviando observaciones de tipo Área para documento con id:', codigoDoc);

    return this.observacionService.getObservacionesArea(codigoDoc);
  }

@Get('area/:id/image')
async getObservacionAreaImage(@Param('id') id: string, @Res() res: Response) {
  console.log("=== DEBUG COMPLETO ===");
  console.log("ID solicitado:", id);
  
  const obs = await this.observacionService.getObservacionAreaById(id);
  console.log("Observación encontrada:", !!obs);
  
  if (!obs || !obs.contentImage) {
    console.log("obs area no encontrada");
    return res.status(404).send('Imagen no encontrada');
  }

  console.log("contentImage desde BD:", obs.contentImage);
  console.log("process.cwd():", process.cwd());
  
  // 1. Verificar si el directorio uploads existe
  const uploadsDir = path.join(process.cwd(), 'uploads');
  console.log("¿Existe uploads?:", fs.existsSync(uploadsDir));
  
  if (fs.existsSync(uploadsDir)) {
    console.log("Contenido de uploads:", fs.readdirSync(uploadsDir));
    
    // 2. Verificar subdirectorio images
    const imagesDir = path.join(uploadsDir, 'images');
    console.log("¿Existe uploads/images?:", fs.existsSync(imagesDir));
    
    if (fs.existsSync(imagesDir)) {
      console.log("Contenido de uploads/images:", fs.readdirSync(imagesDir));
      
      // 3. Verificar subdirectorio obs
      const obsDir = path.join(imagesDir, 'obs');
      console.log("¿Existe uploads/images/obs?:", fs.existsSync(obsDir));
      
      if (fs.existsSync(obsDir)) {
        const obsFiles = fs.readdirSync(obsDir);
        console.log("Archivos en uploads/images/obs:", obsFiles);
        
        // 4. Buscar archivos que contengan el ID
        const matchingFiles = obsFiles.filter(file => file.includes(id));
        console.log("Archivos que coinciden con ID:", matchingFiles);
      }
    }
  }
  
  // 5. Verificar la ruta exacta
  const imagePath = path.resolve(process.cwd(), obs.contentImage);
  console.log('Ruta absoluta construida:', imagePath);
  console.log('¿Existe el archivo específico?:', fs.existsSync(imagePath));
  
  // 6. Verificar todas las rutas posibles
  const possiblePaths = [
    path.resolve(process.cwd(), obs.contentImage),
    path.resolve(process.cwd(), 'src', obs.contentImage),
    path.resolve(process.cwd(), '..', obs.contentImage),
    path.join(process.cwd(), obs.contentImage)
  ];
  
  console.log("=== PROBANDO RUTAS POSIBLES ===");
  possiblePaths.forEach((testPath, index) => {
    console.log(`Ruta ${index + 1}: ${testPath}`);
    console.log(`¿Existe?: ${fs.existsSync(testPath)}`);
  });
  
  if (!fs.existsSync(imagePath)) {
    return res.status(404).json({
      error: 'Archivo no encontrado en servidor',
      contentImage: obs.contentImage,
      searchedPath: imagePath,
      cwd: process.cwd()
    });
  }

  res.sendFile(imagePath);
}
  
  @Post('get-project-obs')
  async getProjectObservaciones(
    @Body('codigoProyecto', ParseIntPipe) codigoProyecto: number,
    @Body('codigoDoc', ParseIntPipe) codigoDoc: number,
  ) {
    console.log(
      `enviando observaciones para proyecto con id: ${codigoProyecto}, excluyendo documento con id: ${codigoDoc}`,
    );
    return this.observacionService.getProjectObservaciones(
      codigoProyecto,
      codigoDoc,
    );
  }

  // =====================
  // 📌 Crear observación simple (sin imagen)
  // =====================
  @Post('create-obs')
  async createObservacion(@Body() highlight: any) {
    return this.observacionService.createObservacion(highlight);
  }

  // =====================
  // 📌 Crear observación de área (con imagen subida)
  // =====================
  @Post('create-obs-area')
  @UseInterceptors(
    FileInterceptor('imageFile', {
      storage: diskStorage({
        destination: './uploads/images/obs',
        filename: (req, file, cb) => {
          const fileName = req.body.fileName || Date.now();
          const ext = extname(file.originalname);
          cb(null, `${fileName}${ext}`);
        },
      }),
    }),
  )
  async createObservacionArea(
    @UploadedFile() file: MulterFile,
    @Body('highlight') highlightString: string,
    @Body('fileName') fileName: string,
  ) {
    const highlight = JSON.parse(highlightString);
    const imagePath = `uploads/images/obs/${fileName}`;

    console.log(
      'creando observación de área para documento con id:',
      highlight.codigoDoc,
    );

    return this.observacionService.createObservacionArea({
      ...highlight,
      content: {
        ...highlight.content,
        image: imagePath,
      },
    });
  }
}
