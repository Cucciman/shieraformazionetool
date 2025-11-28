// ==UserScript==
// @name         ShieraFormazioneTool – Copia/Incolla Formazione Fantacalcio
// @namespace    https://fantacalcio.it/
// @version      1.0
// @description  Copia la formazione da una competizione e incollala in un’altra. Funziona campionato ↔ champions ↔ europa. Svuota automaticamente il campo prima di ricreare la formazione.
// @author       AC
// @match        https://leghe.fantacalcio.it/*/formazione*
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    /********************************
     * OTTIENE TUTTI I GIOCATORI
     ********************************/
    function getFormationPlayers() {
        const players = [];

        // Titolari
        document.querySelectorAll(".formation-item[data-lineup-status='starter']").forEach((el) => {
            players.push({
                id: el.getAttribute("data-id"),
                role: el.querySelector(".role")?.innerText.trim().toLowerCase(),
                zone: el.getAttribute("data-zone"),
                lineup: "starter",
            });
        });

        // Panchina
        document.querySelectorAll(".formation-item[data-lineup-status='reserve']").forEach((el) => {
            players.push({
                id: el.getAttribute("data-id"),
                role: el.querySelector(".role")?.innerText.trim().toLowerCase(),
                zone: el.getAttribute("data-zone"),
                lineup: "reserve",
            });
        });

        return players;
    }

    /********************************
     * SALVA LA FORMAZIONE
     ********************************/
    function saveFormation() {
        const players = getFormationPlayers();
        localStorage.setItem("shieraformazione_data", JSON.stringify(players));
        alert("Formazione COPIATA correttamente!");
    }

    /********************************
     * PULISCE TUTTI GLI SLOT
     ********************************/
    function clearField() {
        document.querySelectorAll("[data-lineup-remove]").forEach((btn) => btn.click());
    }

    /********************************
     * INSERISCE UN GIOCATORE
     ********************************/
    function insertPlayer(player) {
        return new Promise((resolve) => {
            let slotBtn = null;

            if (player.lineup === "starter") {
                slotBtn = document.querySelector(
                    `.formation-item[data-lineup-status='starter'][data-role='${player.role}'] [data-lineup-select]`
                );
            } else {
                slotBtn = document.querySelector(
                    `.formation-item[data-lineup-status='reserve'] [data-lineup-select]`
                );
            }

            if (!slotBtn) return resolve();

            slotBtn.click();

            setTimeout(() => {
                const modalBtn = document.querySelector(
                    `.modal [data-id='${player.id}'] [data-lineup-select]`
                );
                if (modalBtn) modalBtn.click();
                resolve();
            }, 400);
        });
    }

    /********************************
     * INCOLLA LA FORMAZIONE
     ********************************/
    async function loadFormation() {
        const data = localStorage.getItem("shieraformazione_data");
        if (!data) {
            alert("Nessuna formazione copiata. Usa prima COPIA.");
            return;
        }

        const players = JSON.parse(data);

        clearField();

        for (const p of players) {
            await insertPlayer(p);
        }

        alert("Formazione INCOLLATA correttamente!");
    }

    /********************************
     * AGGIUNGE I BOTTONI
     ********************************/
    function addButtons() {
        if (document.getElementById("sft-copy")) return;

        const panel = document.body;

        const btnCopy = document.createElement("button");
        btnCopy.id = "sft-copy";
        btnCopy.textContent = "COPIA FORMAZIONE";
        btnCopy.style = `
            position:fixed;top:120px;right:20px;z-index:9999;
            padding:10px;background:#0057FF;color:#fff;border:none;border-radius:6px;
            cursor:pointer;font-size:14px;
        `;
        btnCopy.onclick = saveFormation;

        const btnPaste = document.createElement("button");
        btnPaste.id = "sft-paste";
        btnPaste.textContent = "INCOLLA FORMAZIONE";
        btnPaste.style = `
            position:fixed;top:165px;right:20px;z-index:9999;
            padding:10px;background:#00A82D;color:#fff;border:none;border-radius:6px;
            cursor:pointer;font-size:14px;
        `;
        btnPaste.onclick = loadFormation;

        panel.appendChild(btnCopy);
        panel.appendChild(btnPaste);
    }

    window.addEventListener("load", addButtons);
})();
