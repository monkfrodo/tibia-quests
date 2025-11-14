/* ============================================
   CONFIGURAÇÃO
   ============================================ */

const API = "https://script.google.com/macros/s/AKfycbzhrtEF6zgkbJFpCGRDzClC1JOgrgtgnP2CRePpVkPsWmn_3XfgFj-T3qtkrNp8ftlwTA/exec";

/* ============================================
   BUSCAR CHAR
   ============================================ */

async function buscarChar() {
  const nick = document.getElementById("nick").value.trim();

  if (!nick) {
    alert("Digite o nickname do personagem.");
    return;
  }

  const res = await fetch(`${API}?route=char-info&name=${encodeURIComponent(nick)}`);
  const dados = await res.json();

  if (!dados.character || !dados.character.name) {
    document.getElementById("charData").innerHTML = `
      <p style="color:#ff7070;">Personagem não encontrado.</p>
    `;
    window.charInfo = null;
    return;
  }

  const c = dados.character;

  window.charInfo = {
    nickname: c.name,
    level: c.level,
    vocacao: c.vocation,
    world: c.world
  };

  document.getElementById("charData").innerHTML = `
    <p><b>${c.name}</b> — Level ${c.level} — ${c.vocation} — ${c.world}</p>
  `;
}

/* ============================================
   REGISTRAR PARTICIPAÇÃO
   ============================================ */

async function registrar() {
  if (!window.charInfo) {
    alert("Busque o personagem primeiro.");
    return;
  }

  const quest = document.getElementById("quest").value;
  const horario = document.getElementById("horario").value;

  if (!horario) {
    alert("Escolha um horário.");
    return;
  }

  const payload = {
    nickname: charInfo.nickname,
    vocacao: charInfo.vocacao,
    level: charInfo.level,
    world: charInfo.world,
    quest,
    horario
  };

  await fetch(`${API}?route=submit`, {
    method: "POST",
    body: JSON.stringify(payload)
  });

  listar();
  calcularMedia();
}

/* ============================================
   LISTAR INSCRITOS
   ============================================ */

async function listar() {
  const res = await fetch(`${API}?route=list`);
  const dados = await res.json();

  const questSel = document.getElementById("quest").value;

  const filtrados = dados.filter(x => x.quest === questSel);

  if (!filtrados.length) {
    document.getElementById("lista").innerHTML = "<p>Ninguém inscrito ainda.</p>";
    return;
  }

  let html = "";

  filtrados.forEach(x => {
    html += `
      <div class="list-item">
        <b>${x.nickname}</b> (${x.vocacao}, lvl ${x.level})<br>
        Horário sugerido: ${x.horario_sugerido}
      </div>
    `;
  });

  document.getElementById("lista").innerHTML = html;
}

/* ============================================
   MÉDIA DE HORÁRIOS
   ============================================ */

async function calcularMedia() {
  const quest = document.getElementById("quest").value;

  const res = await fetch(`${API}?route=quest-info&quest=${encodeURIComponent(quest)}`);
  const dados = await res.json();

  document.getElementById("mediaHorario").innerHTML =
    dados.media ? `<b>Média provável:</b> ${dados.media}` : "Nenhuma sugestão ainda.";
}

/* ============================================
   ATUALIZA TELA AO MUDAR QUEST
   ============================================ */

function atualizarTela() {
  listar();
  calcularMedia();
}

document.addEventListener("DOMContentLoaded", atualizarTela);
