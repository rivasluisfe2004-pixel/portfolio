#!/bin/bash
# Convierte una foto 360° (equirectangular 2:1, como las JPG del DJI Avata 360) en los archivos que usa la web:
#   assets/pano/<id>.js     → versión grande (6144×3072) para el visor
#   assets/pano/<id>.sm.js  → versión ligera (2048×1024) para la vista previa que gira
# Van dentro de un .js (y no como .jpg) para que el 360 funcione también abriendo la web con doble clic.
#
# Uso (desde la Terminal, en la carpeta portfolio-v2):
#   ./tools/add-pano.sh "/Volumes/Disco LF/Drone/CANCUN/Dia2/DJI_xxx_D.JPG" cancun-02
set -e
src="$1"; id="$2"
if [ ! -f "$src" ] || [ -z "$id" ]; then echo 'Uso: ./tools/add-pano.sh foto.jpg id'; exit 1; fi
cd "$(dirname "$0")/.."
mkdir -p assets/pano
tmp=$(mktemp -d)
sips -z 3072 6144 -s formatOptions 80 "$src" --out "$tmp/l.jpg" >/dev/null
sips -z 1024 2048 -s formatOptions 75 "$src" --out "$tmp/s.jpg" >/dev/null
{ printf "(window.PANOS ||= {})['%s'] = 'data:image/jpeg;base64," "$id"; base64 -i "$tmp/l.jpg" | tr -d '\n'; printf "';\n"; } > "assets/pano/$id.js"
{ printf "(window.PANOS_SM ||= {})['%s'] = 'data:image/jpeg;base64," "$id"; base64 -i "$tmp/s.jpg" | tr -d '\n'; printf "';\n"; } > "assets/pano/$id.sm.js"
rm -r "$tmp"
echo "listo → assets/pano/$id.js y assets/pano/$id.sm.js"
