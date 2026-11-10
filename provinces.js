'use strict';
let provinceMode=false,provinceSelection='WC';
const provinceFeatures=window.ATLAS_PROVINCES.features;
const provinceById=new Map(provinceFeatures.map(f=>[f.properties.shapeISO,f]));
const provinceMap=d3.select('.map-area').insert('svg','.map-controls').attr('id','province-map').attr('viewBox','0 0 1000 610').attr('role','group').attr('aria-label','South Africa provinces. Hover or focus a province for its capital and a fact.').style('display','none');
const provinceProjection=d3.geoMercator().fitExtent([[130,95],[840,545]],window.ATLAS_PROVINCES);
const provincePath=d3.geoPath(provinceProjection),provinceLayer=provinceMap.append('g');
const neighborIds=new Set(['516','072','716','508','748','426','894','024']);
const neighborLayer=provinceLayer.append('g').attr('class','neighbor-layer').attr('aria-hidden','true').attr('pointer-events','none');
neighborLayer.selectAll('path').data(features.filter(f=>neighborIds.has(f.id))).join('path').attr('d',provincePath);
const neighborNames=[['NAMIBIA',[17.6,-24.1]],['BOTSWANA',[24,-22.8]],['ZIMBABWE',[29.5,-20.2]],['MOZAMBIQUE',[34.5,-24]],['LESOTHO',[28.3,-29.6]],['ESWATINI',[31.5,-26.5]]];
neighborLayer.selectAll('text').data(neighborNames).join('text').attr('x',d=>provinceProjection(d[1])[0]).attr('y',d=>provinceProjection(d[1])[1]).attr('text-anchor','middle').text(d=>d[0]);
// Satellite tiles use the same Web Mercator projection as the province outlines.
provinceMap.append('defs').append('clipPath').attr('id','sa-land-clip').append('path').attr('d',provinceFeatures.map(provincePath).join(' '));
const satelliteLayer=provinceLayer.append('g').attr('class','satellite-layer').attr('clip-path','url(#sa-land-clip)').attr('pointer-events','none');
let satelliteEnabled=true,satelliteLoaded=0,satelliteFailed=0;
const satelliteTiles=[];
const tileZoom=7,tileCount=2**tileZoom;
const tileLatitude=y=>Math.atan(Math.sinh(Math.PI*(1-2*y/tileCount)))*180/Math.PI;
const tileY=lat=>Math.floor((1-Math.asinh(Math.tan(lat*Math.PI/180))/Math.PI)/2*tileCount);
for(let x=Math.floor((16.45+180)/360*tileCount);x<=Math.floor((32.95+180)/360*tileCount);x++)for(let y=tileY(-22.12);y<=tileY(-34.84);y++){
 const a=provinceProjection([x/tileCount*360-180,tileLatitude(y)]),b=provinceProjection([(x+1)/tileCount*360-180,tileLatitude(y+1)]);
 satelliteTiles.push({x,y,left:a[0],top:a[1],width:b[0]-a[0],height:b[1]-a[1]});
}
satelliteLayer.selectAll('image').data(satelliteTiles).join('image').attr('x',d=>d.left).attr('y',d=>d.top).attr('width',d=>d.width+.1).attr('height',d=>d.height+.1).attr('preserveAspectRatio','none').on('load',()=>{satelliteLoaded++;updateImageryStatus();}).on('error',()=>{satelliteFailed++;updateImageryStatus();}).attr('href',d=>`imagery/${tileZoom}-${d.y}-${d.x}.jpg`);
const provincePaths=provinceLayer.append('g').attr('class','province-boundaries').selectAll('path').data(provinceFeatures).join('path').attr('class','province-shape').attr('d',provincePath).attr('fill',f=>f.properties.color).attr('role','button').attr('tabindex',0).attr('aria-label',f=>f.properties.name);
provincePaths.style('--province-color',f=>f.properties.color);
const provinceLabels=provinceLayer.append('g').attr('class','province-labels');
provinceFeatures.forEach(f=>{const p=f.properties,xy=provinceProjection(p.center);provinceLabels.append('text').attr('x',xy[0]).attr('y',xy[1]).text(p.shapeISO==='GT'?'GP':p.name);});
const provinceZoom=d3.zoom().scaleExtent([1,6]).extent([[0,0],[1000,610]]).translateExtent([[-100,-70],[1100,680]]).on('zoom',e=>{provinceLayer.attr('transform',e.transform);$('tooltip').hidden=true;});
provinceMap.call(provinceZoom).on('dblclick.zoom',null);
const toolbar=document.querySelector('.toolbar');
const provinceNav=document.createElement('div');provinceNav.className='province-nav';provinceNav.hidden=true;provinceNav.innerHTML='<button id="back-world">← Back to world</button><span>South Africa <b>/</b> Provinces</span><button id="province-reset" aria-label="Reset province map">Reset view ↺</button>';toolbar.after(provinceNav);
const provinceKey=document.createElement('div');provinceKey.className='province-key';provinceKey.hidden=true;provinceKey.innerHTML='<span>9 PROVINCES</span><p>Hover over a province for its capital and a fact.</p>';
document.querySelector('.map-area').append(provinceKey);
const imageryControls=document.createElement('div');imageryControls.className='imagery-controls';imageryControls.innerHTML='<div class="map-style-switch" aria-label="Map style"><button id="style-satellite" aria-pressed="true">Satellite</button><button id="style-colors" aria-pressed="false">Colors</button></div><span id="imagery-status" role="status">Loading imagery…</span>';
provinceNav.insertBefore(imageryControls,$('province-reset'));
const imageryCredit=document.createElement('div');imageryCredit.className='imagery-credit';imageryCredit.innerHTML='<a href="https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer" target="_blank" rel="noreferrer">Imagery: Esri, Vantor, Earthstar Geographics, GIS User Community</a>';document.querySelector('.map-area').append(imageryCredit);
function updateImageryStatus(){const status=$('imagery-status');if(!status)return;status.textContent=satelliteFailed?'Some imagery unavailable · try Colors':satelliteLoaded===satelliteTiles.length?'Satellite imagery · ready':'Loading imagery…';}
function setMapStyle(satellite){satelliteEnabled=satellite;document.body.classList.toggle('satellite-style',satellite);satelliteLayer.style('display',satellite?null:'none');$('style-satellite').setAttribute('aria-pressed',String(satellite));$('style-colors').setAttribute('aria-pressed',String(!satellite));$('imagery-status').hidden=!satellite;imageryCredit.hidden=!satellite;}
$('style-satellite').onclick=()=>setMapStyle(true);$('style-colors').onclick=()=>setMapStyle(false);setMapStyle(true);
const originalRenderDetails=renderDetails;
renderDetails=function(){originalRenderDetails();if(selected==='710'){const b=document.createElement('button');b.className='explore-provinces';b.textContent='Explore 9 provinces →';b.onclick=enterProvinces;$('details').querySelector('.sub').after(b);}};
const originalZoomIn=$('zoom-in').onclick,originalZoomOut=$('zoom-out').onclick,originalReset=$('reset').onclick;
$('zoom-in').onclick=()=>provinceMode?provinceMap.transition().duration(duration).call(provinceZoom.scaleBy,1.5):originalZoomIn();
$('zoom-out').onclick=()=>provinceMode?provinceMap.transition().duration(duration).call(provinceZoom.scaleBy,1/1.5):originalZoomOut();
$('reset').onclick=()=>provinceMode?resetProvinces():originalReset();
$('province-reset').onclick=resetProvinces;
function resetProvinces(){provinceMap.transition().duration(duration).call(provinceZoom.transform,d3.zoomIdentity);}
let enteringProvinces=false;
function enterProvinces(){
 if(provinceMode||enteringProvinces)return;
 enteringProvinces=true;$('tooltip').hidden=true;
 const country=features.find(f=>f.id==='710'),bounds=path.bounds(country);
 const [[x0,y0],[x1,y1]]=bounds;
 const target=d3.zoomIdentity.translate(500,305).scale(Math.min(8,.7/Math.max((x1-x0)/1000,(y1-y0)/610))).translate(-(x0+x1)/2,-(y0+y1)/2);
 document.querySelector('.map-area').classList.add('entering-country');
 const complete=()=>{enteringProvinces=false;document.querySelector('.map-area').classList.remove('entering-country');showProvinces();};
 if(reduced){svg.call(zoom.transform,target);complete();return;}
 svg.transition().duration(1050).ease(d3.easeCubicInOut).call(zoom.transform,target).on('end',complete).on('interrupt',()=>{enteringProvinces=false;document.querySelector('.map-area').classList.remove('entering-country');});
}
function showProvinces(){provinceMode=true;document.body.classList.add('province-mode');$('results').hidden=true;$('tooltip').hidden=true;svg.interrupt();svg.style('display','none');provinceMap.style('display','block');toolbar.hidden=true;provinceNav.hidden=false;provinceKey.hidden=false;document.querySelector('.legend').hidden=true;document.querySelector('.map-footer').hidden=true;document.querySelector('.summary').hidden=true;$('map-title').textContent='South Africa';$('map-unit').textContent='Nine provinces. Nine perspectives.';document.querySelector('.sample-badge').innerHTML='<i></i> Province explorer · South Africa';$('details').setAttribute('aria-label','Selected province details');selectProvince(provinceSelection);}
function leaveProvinces(){provinceMode=false;document.body.classList.remove('province-mode');provinceMap.interrupt().style('display','none');svg.style('display','block');toolbar.hidden=false;provinceNav.hidden=true;provinceKey.hidden=true;document.querySelector('.legend').hidden=false;document.querySelector('.map-footer').hidden=false;document.querySelector('.summary').hidden=false;document.querySelector('.sample-badge').innerHTML='<i></i> Illustrative dataset · 2024';$('tooltip').hidden=true;$('details').setAttribute('aria-label','Selected country details');changeMetric(current);selectCountry('710');}
$('back-world').onclick=leaveProvinces;
function selectProvince(id){provinceSelection=id;const p=provinceById.get(id).properties;provincePaths.classed('selected',f=>f.properties.shapeISO===id).attr('aria-pressed',f=>String(f.properties.shapeISO===id));provincePaths.filter(f=>f.properties.shapeISO===id).raise();provinceLabels.raise();$('tooltip').hidden=true;$('details').innerHTML=`<div class="detail-top"><span class="detail-label">PROVINCE SPOTLIGHT</span><span class="province-dot" style="background:${p.color}"></span></div><h2>${p.name}</h2><div class="sub">South Africa · ${p.tag}</div><div class="province-capital"><span>PROVINCIAL CAPITAL</span><strong>${p.capital}</strong></div><div class="province-fact"><span>DID YOU KNOW?</span><p>${p.fact}</p></div><div class="metrics-heading">EXPLORE ALL NINE</div><div class="province-list">${provinceFeatures.map(f=>{const x=f.properties;return `<button data-province="${x.shapeISO}" aria-pressed="${id===x.shapeISO}" class="${id===x.shapeISO?'active':''}"><i style="background:${x.color}"></i><span>${x.name}</span><b>${id===x.shapeISO?'↗':'→'}</b></button>`}).join('')}</div><p class="province-source">Province boundaries: <a href="https://www.geoboundaries.org/" target="_blank" rel="noreferrer">geoBoundaries</a>. Colors identify regions, not statistics.</p>`;$('details').querySelectorAll('[data-province]').forEach(b=>b.onclick=()=>selectProvince(b.dataset.province));}
function provinceTooltip(event,f){const p=f.properties,tip=$('tooltip');tip.innerHTML=`<span class="hover-province-name">${p.name}</span><span class="hover-capital">Capital · ${p.capital}</span><span class="hover-fact">${p.fact}</span>`;tip.hidden=false;const rect=$('province-map').getBoundingClientRect(),bound=event.type==='focus'?event.target.getBoundingClientRect():null;const x=(bound?bound.x+bound.width/2:event.clientX)-rect.left+14,y=(bound?bound.y+bound.height/2:event.clientY)-rect.top+14;tip.style.left=Math.max(8,Math.min(x,rect.width-tip.offsetWidth-8))+'px';tip.style.top=Math.max(8,Math.min(y,rect.height-tip.offsetHeight-8))+'px';}
provincePaths.on('click',(e,f)=>selectProvince(f.properties.shapeISO)).on('pointermove',provinceTooltip).on('pointerleave',()=>$('tooltip').hidden=true).on('focus',provinceTooltip).on('blur',()=>$('tooltip').hidden=true).on('keydown',(e,f)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectProvince(f.properties.shapeISO)}if(e.key==='Escape')$('tooltip').hidden=true;});
paths.on('click',(e,f)=>{selectCountry(f.id);if(f.id==='710')enterProvinces();}).on('keydown',(e,f)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectCountry(f.id);if(f.id==='710')enterProvinces()}if(e.key==='Escape')$('tooltip').hidden=true;});
renderDetails();
// Start on the world map and transition into South Africa.
