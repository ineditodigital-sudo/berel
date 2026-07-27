(() => {
  const cfg = window.BEREL_CMS;
  const grid = document.querySelector('#resource-grid');
  const search = document.querySelector('#search');
  const dialog = document.querySelector('#editor');
  const form = document.querySelector('#editor-form');
  const fields = document.querySelector('#editor-fields');
  const notice = document.querySelector('#cms-notice');
  const descriptions = {
    products:['CATÁLOGO','Organiza productos, precios, existencias e imágenes.'],
    categories:['CATÁLOGO','Agrupa tus productos en categorías fáciles de encontrar.'],
    orders:['VENTAS','Consulta pedidos, pagos y entregas desde un solo lugar.'],
    pages:['SITIO WEB','Gestiona páginas publicadas y su información para buscadores.'],
    content:['EDITOR VISUAL','Actualiza títulos, textos, botones, colores y enlaces.'],
    slides:['CONTENIDO','Administra las campañas principales de la tienda.'],
    media:['ARCHIVOS','Organiza imágenes y fichas técnicas.'],
    faqs:['AYUDA','Responde las preguntas frecuentes de tus clientes.'],
    branches:['OPERACIÓN','Gestiona direcciones, mapas, contacto y retiro.'],
    settings:['CONFIGURACIÓN','Controla contacto, envíos, pagos y avisos de venta.']
  };
  const labels = {
    sku:'SKU',name:'Nombre',slug:'URL amigable',category_id:'Categoría',short_description:'Descripción corta',
    description:'Descripción',price_cents:'Precio (centavos)',compare_at_cents:'Precio anterior (centavos)',
    stock:'Existencia',image_url:'Imagen',gallery_json:'Galería',technical_sheet_url:'Ficha técnica',
    benefits_json:'Beneficios',uses:'Usos',whatsapp_message:'Mensaje de WhatsApp',is_active:'Visible',
    is_featured:'Destacado',sort_order:'Orden',title:'Título',status:'Estado',seo_title:'Título SEO',
    seo_description:'Descripción SEO',page_id:'Página',block_key:'Clave interna',type:'Tipo',body:'Texto',
    config_json:'Diseño y enlaces',eyebrow:'Antetítulo',button_label:'Texto del botón',button_url:'Enlace',
    theme:'Tema',question:'Pregunta',answer:'Respuesta',address:'Dirección',city:'Ciudad',state:'Estado',
    postal_code:'Código postal',phone:'Teléfono',whatsapp:'WhatsApp',map_url:'Mapa',schedule:'Horario',
    is_pickup_enabled:'Permite retiro',payment_status:'Estado de pago',notes:'Notas',value_json:'Configuración'
  };
  let active = 'products', items = [], editing = null;
  const api = async (path, options={}) => {
    const response = await fetch('/api/admin/'+path,{...options,headers:{...(options.headers||{}),'X-CSRF-Token':cfg.csrf}});
    const data = await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(data.error||'No se pudo completar la operación.');
    return data;
  };
  const esc = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const titleFor = row => row.name||row.title||row.question||row.order_number||row.key||'Sin título';
  const subFor = row => row.sku||row.slug||row.customer_email||row.city||row.block_key||row.mime_type||'';
  const showNotice = (text,error=false) => { notice.textContent=text; notice.className='notice '+(error?'error':'success'); notice.hidden=false; setTimeout(()=>notice.hidden=true,4500); };
  const money = cents => '$'+(Number(cents||0)/100).toLocaleString('es-MX',{minimumFractionDigits:2});
  async function load(){
    grid.innerHTML='<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>';
    try { items=(await api(active)).items||[]; render(); } catch(e){grid.innerHTML='';showNotice(e.message,true);}
  }
  function render(){
    const needle=search.value.trim().toLowerCase();
    const visible=items.filter(row=>!needle||Object.values(row).some(v=>String(v??'').toLowerCase().includes(needle)));
    if(!visible.length){grid.innerHTML='<div class="empty-state"><span>＋</span><h2>No hay elementos</h2><p>Crea el primero o cambia tu búsqueda.</p></div>';return;}
    grid.innerHTML=visible.map(row=>{
      const visual=row.image_url||row.url||'';
      const showVisual=['products','media','slides'].includes(active);
      return `<article class="resource-card">
        ${showVisual?`<div class="resource-image">${visual&&!String(row.mime_type||'').includes('pdf')?`<img src="${esc(visual)}" alt="${esc(row.alt_text||titleFor(row))}">`:'<span>Imagen</span>'}${active==='products'?`<small>${Number(row.stock||0)} disponibles</small>`:''}</div>`:''}
        <div class="resource-body"><div class="resource-meta"><span class="status ${Number(row.is_active)===0?'off':''}">${row.status?esc(row.status):Number(row.is_active)===0?'Oculto':'Visible'}</span><span>${esc(subFor(row))}</span></div>
        <h2>${esc(titleFor(row))}</h2>${active==='products'?`<strong>${money(row.price_cents)}</strong>`:''}${active==='orders'?`<strong>${money(row.total_cents)}</strong>`:''}
        ${active==='faqs'?`<p>${esc(row.answer)}</p>`:''}${active==='branches'?`<p>${esc(row.address)}</p>`:''}</div>
        <footer><button data-edit="${esc(row.id??row.key)}">Editar</button>${!['orders','settings'].includes(active)?`<button class="danger" data-delete="${esc(row.id)}">Eliminar</button>`:''}</footer>
      </article>`;
    }).join('');
  }
  function openEditor(row=null){
    editing=row; fields.innerHTML='';
    document.querySelector('#editor-eyebrow').textContent=row?'EDITAR':'CREAR';
    document.querySelector('#editor-title').textContent=row?titleFor(row):'Nuevo '+cfg.resources[active].singular;
    cfg.resources[active].fields.forEach(key=>{
      const value=row?.[key]??'';
      const wide=['description','short_description','body','answer','address','notes','whatsapp_message','benefits_json','gallery_json','config_json','value_json'].includes(key);
      const boolean=key.startsWith('is_');
      const type=['price_cents','compare_at_cents','stock','sort_order'].includes(key)?'number':key.includes('url')?'url':'text';
      const control=boolean
        ? `<label class="toggle"><input name="${key}" type="checkbox" ${Number(value)!==0?'checked':''}><span></span><b>${esc(labels[key]||key)}</b></label>`
        : wide?`<textarea name="${key}" rows="5">${esc(value)}</textarea>`:`<input name="${key}" type="${type}" value="${esc(value)}">`;
      fields.insertAdjacentHTML('beforeend',`<label class="${wide?'wide':''}">${boolean?'':`<span>${esc(labels[key]||key)}</span>`}${control}</label>`);
    });
    dialog.showModal();
  }
  async function remove(id){
    if(!confirm('¿Eliminar este elemento? Esta acción no se puede deshacer.'))return;
    try{await api(active+'/'+encodeURIComponent(id),{method:'DELETE'});showNotice('El elemento fue eliminado.');load();}catch(e){showNotice(e.message,true);}
  }
  function selectModule(key){
    active=key; search.value=''; editing=null;
    document.querySelectorAll('[data-resource]').forEach(b=>b.classList.toggle('active',b.dataset.resource===key));
    document.querySelector('#module-title').textContent=cfg.resources[key].label;
    document.querySelector('#module-eyebrow').textContent=descriptions[key]?.[0]||'ADMINISTRACIÓN';
    document.querySelector('#module-description').textContent=descriptions[key]?.[1]||'Administra la información de tu tienda.';
    const newButton=document.querySelector('#new-action');
    newButton.hidden=['orders','media','settings'].includes(key);
    newButton.textContent='+ Nuevo '+cfg.resources[key].singular;
    const upload=document.querySelector('#upload-action');
    upload.hidden=!['products','media'].includes(key);
    upload.firstChild.textContent=key==='products'?'Importar CSV':'Subir archivo';
    document.body.classList.remove('menu-open'); load();
  }
  document.addEventListener('click',e=>{
    const module=e.target.closest('[data-resource]'); if(module)selectModule(module.dataset.resource);
    const edit=e.target.closest('[data-edit]'); if(edit)openEditor(items.find(row=>String(row.id??row.key)===edit.dataset.edit));
    const del=e.target.closest('[data-delete]'); if(del)remove(del.dataset.delete);
    if(e.target.closest('[data-open-menu]'))document.body.classList.add('menu-open');
    if(e.target.closest('[data-close-menu]'))document.body.classList.remove('menu-open');
  });
  search.addEventListener('input',render);
  document.querySelector('#new-action').addEventListener('click',()=>openEditor());
  form.addEventListener('submit',async e=>{
    e.preventDefault(); const data={};
    cfg.resources[active].fields.forEach(key=>{
      const input=form.elements[key]; if(!input)return;
      data[key]=input.type==='checkbox'?input.checked:input.value;
    });
    try{
      const id=editing?.id??editing?.key;
      await api(active+(id?'/'+encodeURIComponent(id):''),{method:id?'PATCH':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      dialog.close();showNotice('Los cambios se guardaron correctamente.');load();
    }catch(err){showNotice(err.message,true);}
  });
  document.querySelector('#upload-action input').addEventListener('change',async e=>{
    const file=e.target.files?.[0];if(!file)return;const body=new FormData();body.append('file',file);
    try{const result=await api(active==='products'?'import-products':'media-upload',{method:'POST',body});showNotice(active==='products'?`${result.created} creados y ${result.updated} actualizados.`:'Archivo subido.');load();}catch(err){showNotice(err.message,true);}finally{e.target.value='';}
  });
  load();
})();
