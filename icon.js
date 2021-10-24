/*Copyright 2015-2019 Kirk McDonald

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.*/
"use strict"

var PX_WIDTH = 32
var PX_HEIGHT = 32

var sheet_hash

function Sprite(name, col, row) {
    this.name = name
    this.icon_col = col
    this.icon_row = row
}

function getImage(obj, suppressTooltip, tooltipTarget) {
    var im = blankImage()
    im.classList.add("icon")
    var x = -obj.icon_col * PX_WIDTH
    var y = -obj.icon_row * PX_HEIGHT
    im.style.setProperty("background", "url(images/sprite-sheet-" + sheet_hash + ".png)")
    im.style.setProperty("background-position", x + "px " + y + "px")
    if (tooltipsEnabled && obj.renderTooltip && !suppressTooltip) {
        addTooltip(im, obj, tooltipTarget)
    } else {
        im.title = obj.name
    }
    im.alt = obj.name
    return im
}

function getIconSvgTooltip(obj, suppressTooltip, tooltipTarget)
{
    var svg = getIconSvg(obj, null, null, PX_WIDTH, false);

    svg.classList.add("icon")

    if (tooltipsEnabled && obj.renderTooltip && !suppressTooltip) {
        addTooltip(svg, obj, tooltipTarget)
    } else {
        var title = document.createElementNS("http://www.w3.org/2000/svg", "title");
        title.textContent = obj.name;
        svg.append(title);
    }

    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", obj.name);

    return svg;
}

var GLOBAL_COUNTER_SRJ = 0;
function getIconSvg(d, x, y, width, ignore)
{
    var icons = d.icons;
    if (icons == null)
    {
        icons = [ d ]
    }

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    if (x != null)
    {
        svg.setAttribute("x", x);
    }
    if (y != null)
    {
        svg.setAttribute("y", y);
    }
    svg.setAttribute("width", width);
    svg.setAttribute("height", width);
    if (ignore)
    {
        svg.classList.add("ignore");
    }

    var defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    svg.append(defs);

    for (var icon of icons)
    {
        if (icon.tint != null)
        {
            var filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
            filter.setAttribute("id", "icon_filter" + GLOBAL_COUNTER_SRJ);

            var r = icon.tint.r / 1.0;
            var g = icon.tint.g / 1.0;
            var b = icon.tint.b / 1.0;

            var matrix = document.createElementNS("http://www.w3.org/2000/svg", "feColorMatrix");
            matrix.setAttribute("in", "SourceGraphic");
            matrix.setAttribute("values",
                icon.tint.r + " 0 0 0 0 \
                    0 " + icon.tint.g + " 0 0 0 \
                    0 0 " + icon.tint.b + " 0 0 \
                    0 0 0 " + icon.tint.a + " 0");
            filter.append(matrix);

            defs.append(filter);
        }

        var inner_g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        if (icon.tint != null)
        {
            inner_g.setAttribute("filter", "url(#icon_filter" + GLOBAL_COUNTER_SRJ + ")");
            GLOBAL_COUNTER_SRJ += 1;
        }
        var transform = "";
        if (icon.scale != null || icon.shift != null)
        {
            var x = 0; var y = 0;
            var scale = 1;
            if (icon.shift != null)
            {
                x += icon.shift[0];
                y += icon.shift[1];
            }
            if (icon.scale != null)
            {
                scale = icon.scale / (32 / icon.icon_size);
                x -= 32 * (scale - 1) / 2;
                y -= 32 * (scale - 1) / 2;
            }
            var transform = "translate(" + x + ", " + y + ")";
            if (icon.scale != null)
            {
                transform += " scale(" + scale + ") ";
            }
            inner_g.setAttribute("transform", transform);
        }

        var inner_svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        inner_svg.setAttribute("viewBox", imageViewBox(icon));

        var image = document.createElementNS("http://www.w3.org/2000/svg", "image");
        image.setAttributeNS("http://www.w3.org/1999/xlink", "href", "images/sprite-sheet-" + sheet_hash + ".png");

        inner_svg.append(image);
        inner_g.append(inner_svg);
        svg.append(inner_g);
    }

    return svg;
}

function addTooltip(im, obj, target) {
    var node = obj.renderTooltip()
    return new Tooltip(im, node, target)
}

function blankImage() {
    var im = document.createElement("img")
    // Chrome wants the <img> element to have a src attribute, or it will
    // draw a border around it. Cram in this transparent 1x1 pixel image.
    im.src = "images/pixel.gif"
    return im
}

var sprites

function getExtraImage(name) {
    return getImage(sprites[name])
}

function getSprites(data) {
    sheet_hash = data.sprites.hash
    sprites = {}
    for (var name in data.sprites.extra) {
        var d = data.sprites.extra[name]
        sprites[name] = new Sprite(d.name, d.icon_col, d.icon_row)
    }
}
