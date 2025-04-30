# Página de Amor Responsiva

Esta es una página web romántica con dos pantallas interactivas. Aquí encontrarás las instrucciones para personalizar los contenidos.

## Cómo Modificar los Contenidos

### Pantalla 1

#### Cambiar el Video de Fondo
1. Abre el archivo `src/components/Screen1.tsx`
2. Busca la etiqueta `<source src="...">`
3. Reemplaza la URL actual con la URL de tu video
4. El video debe ser en formato MP4

#### Modificar el Título Principal
1. En `src/components/Screen1.tsx`
2. Busca el texto "TE AMO COTI"
3. Reemplázalo con tu mensaje deseado

#### Cambiar el Mensaje de Typewriter
1. En `src/components/Screen1.tsx`
2. Encuentra `<TypewriterEffect text="que tengas buen viaje, siempre con vos" />`
3. Modifica el texto entre comillas

### Pantalla 2

#### Carrusel de Fotos
1. Abre `src/components/PhotoCarousel.tsx`
2. Localiza el array `photos`
3. Reemplaza las URLs existentes con las URLs de tus fotos
4. Asegúrate de que las nuevas URLs sean válidas y accesibles

#### Video Principal
1. En `src/components/VideoPlayer.tsx`
2. Busca las siguientes líneas:
   - `poster="..."` para cambiar la imagen de vista previa
   - `<source src="..."` para cambiar el video principal
3. Reemplaza las URLs con las de tu contenido

#### Mensaje Romántico
1. Abre `src/components/RomanticMessage.tsx`
2. Modifica los siguientes elementos:
   - `Mi Amor Eterno` - título del mensaje
   - Los párrafos dentro de `<p className="text-gray-700 mb-4">`
   - El texto expandido dentro de `expanded-content`

### Títulos de Secciones
1. En `src/components/Screen2.tsx`
2. Busca los elementos `<h2>` con las clases `text-2xl`
3. Modifica los textos:
   - "Nuestros Momentos"
   - "Nuestro Video"
   - "Para Ti"

## Consejos Importantes
- Mantén las URLs de las imágenes y videos en formato HTTPS
- Asegúrate de que los archivos multimedia sean optimizados para web
- Las imágenes deben tener una resolución adecuada (recomendado: máximo 1920px de ancho)
- Los videos deben estar en formato MP4 y ser optimizados para streaming