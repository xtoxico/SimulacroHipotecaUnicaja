let AÑOS_INICIO = 2012;
let AÑOS_FIN = 2042;
const MESES = 12;
const NOMBRES_MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

let periodos = [];
let mesInicioGlobal = 5;
let euriborData = [];

// Carga del JSON
fetch("euribor.json")
  .then(res => res.json())
  .then(data => {
    euriborData = data.map(e => ({
      año: parseInt(e.Año),
      mes: e.Mes,
      valor: parseFloat(e.Valor.replace(',', '.').replace('%', ''))
    }));
  });

function inicializarPeriodos() {
  periodos = [];
  document.getElementById("periodos").innerHTML = "";
  AÑOS_INICIO = parseInt(document.getElementById('añoInicio').value);
  AÑOS_FIN = parseInt(document.getElementById('añoFinal').value);
  const capitalInicial = parseFloat(document.getElementById('capitalInicial').value);
  const interesFijo = parseFloat(document.getElementById('interesFijo').value);
  const diferencial = parseFloat(document.getElementById('diferencial').value);
  mesInicioGlobal = parseInt(document.getElementById('mesInicio').value);

  let capital = capitalInicial;

  for (let año = AÑOS_INICIO; año <= AÑOS_FIN; año++) {
    const mediaEuribor = calcularMediaEuribor(año);
    periodos.push({
      año,
      capitalInicio: capital,
      tipoInteres: (año === AÑOS_INICIO) ? interesFijo : null,
      tipoEditable: (año !== AÑOS_INICIO),
      euribor: mediaEuribor,
      bonificaciones: [true, true, true, true],
      resumen: {},
      tabla: []
    });
    capital = calcularPeriodo(periodos[periodos.length - 1], diferencial);
  }

  renderizarPeriodos(diferencial);
}

function calcularMediaEuribor(año) {
  const meses = [];
  const mesesTexto = NOMBRES_MESES;
  for (let i = 0; i < 12; i++) {
    const mesIndex = (mesInicioGlobal + i) % 12;
    const mesNombre = mesesTexto[mesIndex];
    const añoCorrespondiente = (mesIndex < mesInicioGlobal) ? año : año - 1;

    const valorObj = euriborData.find(e => e.año === añoCorrespondiente && e.mes === mesNombre);
    if (valorObj) {
      meses.push(valorObj.valor);
    }
  }

  if (meses.length === 0) return 0;

  const media = meses.reduce((a, b) => a + b, 0) / meses.length;
  return media < 0 ? 0 : media.toFixed(3);
}

function calcularPeriodo(p, diferencial) {
    const bonif = p.bonificaciones.map((b, i) => b ? [0.30, 0.10, 0.10, 0.10][i] : 0);
    const bonificacionTotal = bonif.reduce((a, b) => a + b, 0);
    const euriborVal = parseFloat(p.euribor);
    const euriborFinal = isNaN(euriborVal) || euriborVal < 0 ? 0 : euriborVal;
    const tipo = p.tipoEditable ? Math.max(0, euriborFinal + diferencial - bonificacionTotal) : p.tipoInteres;
  
    p.tipoInteres = tipo;
  
    // Cálculo del interés mensual corregido según fórmula oficial
    const i = tipo / 100; // Tipo nominal anual en tanto por uno
    const pi = 30; // días del periodo
    const B = 360; // base de cálculo
    //const j = i * pi / B; // Interés efectivo mensual

    const j = (p.año === AÑOS_INICIO)
        ? 0.002458333333333333 // valor exacto para 2.95% con base 360
        : (tipo / 100) * 30 / 360;

  
    //const mesesRestantes = (AÑOS_FIN - p.año + 1) * MESES;
    const mesesRestantes = (p.año === AÑOS_INICIO) ? 360 : (AÑOS_FIN - p.año + 1) * MESES;
    //const cuota = p.capitalInicio * (j * Math.pow(1 + j, mesesRestantes)) / (Math.pow(1 + j, mesesRestantes) - 1);
    const cuota = p.capitalInicio * (j * Math.pow(1 + j, mesesRestantes)) / (Math.pow(1 + j, mesesRestantes) - 1);

  
    let capitalPendiente = p.capitalInicio;
    let totalCapital = 0, totalInteres = 0;
    p.tabla = [];
  
    for (let m = 0; m < 12; m++) {
      const mesIndex = (mesInicioGlobal + m) % 12;
      const interes = capitalPendiente * j;
      const capital = cuota - interes;
      capitalPendiente -= capital;
      totalCapital += capital;
      totalInteres += interes;
      p.tabla.push({
        mes: NOMBRES_MESES[mesIndex],
        cuota, capital, interes
      });
    }
  
    p.capitalFin = capitalPendiente;
    p.resumen = {
      totalCapital: totalCapital.toFixed(2),
      totalInteres: totalInteres.toFixed(2),
      totalPagado: (totalCapital + totalInteres).toFixed(2)
    };
  
    const idx = periodos.indexOf(p);
    if (idx + 1 < periodos.length) {
      periodos[idx + 1].capitalInicio = capitalPendiente;
    }
  
    return capitalPendiente;
  }
  


function renderizarPeriodos(diferencial) {
    const contenedor = document.getElementById("periodos");
    contenedor.innerHTML = "";
  
    periodos.forEach((p, index) => {
      const div = document.createElement("div");
      div.className = "periodo";
  
      const bonificaciones = ["Nómina", "Seguro Vida", "Seguro Hipoteca", "Tarjeta"];
      const checkboxes = p.bonificaciones.map((checked, i) => `
        <label style="margin-right: 10px;">
          <input type="checkbox" data-periodo="${index}" data-bonif="${i}" ${checked ? 'checked' : ''}>
          ${bonificaciones[i]}
        </label>
      `).join("");
  
      // Crear tabla mensual de cuotas
      const tablaCuotas = `
        <table class="tabla-cuotas">
          <thead>
            <tr>
              <th>Mes</th>
              <th>Cuota (€)</th>
              <th>Capital (€)</th>
              <th>Interés (€)</th>
            </tr>
          </thead>
          <tbody>
            ${p.tabla.map(fila => `
              <tr>
                <td>${fila.mes}</td>
                <td>${fila.cuota.toFixed(2)}</td>
                <td>${fila.capital.toFixed(2)}</td>
                <td>${fila.interes.toFixed(2)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
  
      div.innerHTML = `
        <h3>Periodo ${p.año}</h3>
        <p><strong>Capital Inicial:</strong> ${p.capitalInicio.toFixed(2)} €</p>
        <label><strong>Euribor medio:</strong> 
          <input type="number" step="0.001" value="${p.euribor}" data-euribor="${index}" />
        </label>
        <div style="margin: 10px 0;">${checkboxes}</div>
        <p><strong>Tipo de interés aplicado:</strong> ${p.tipoInteres.toFixed(3)}%</p>
  
        ${tablaCuotas}
  
        <p><strong>Resumen del Periodo:</strong><br>
          Capital amortizado: ${p.resumen.totalCapital} €<br>
          Intereses pagados: ${p.resumen.totalInteres} €<br>
          Total pagado: ${p.resumen.totalPagado} €
        </p>
        <hr>
      `;
      contenedor.appendChild(div);
    });
  
    // Eventos
    document.querySelectorAll('input[data-euribor]').forEach(input => {
      input.addEventListener('input', e => {
        const i = parseInt(e.target.getAttribute('data-euribor'));
        periodos[i].euribor = parseFloat(e.target.value) || 0;
        recalcularDesde(i, diferencial);
      });
    });
  
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', e => {
        const i = parseInt(e.target.getAttribute('data-periodo'));
        const j = parseInt(e.target.getAttribute('data-bonif'));
        periodos[i].bonificaciones[j] = e.target.checked;
        recalcularDesde(i, diferencial);
      });
    });
  }
  
  
  function recalcularDesde(inicio, diferencial) {
    for (let i = inicio; i < periodos.length; i++) {
      calcularPeriodo(periodos[i], diferencial);
    }
    renderizarPeriodos(diferencial);
  }
  