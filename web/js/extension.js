import { app } from "/scripts/app.js";

app.registerExtension({
    name: "MIM.PromptTemplateJsonConstructor",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "PromptTemplateJsonConstructor") {
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function() {
                const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;
                // Функция для обновления высоты
                const initUI = () => {
                    const widget = this.widgets?.find(w => w.name === "variables_json");
                    if (!widget || !widget.inputEl || widget.inputEl.parentNode?.querySelector(".prompt-template-ui")) {
                        return;
                    }
                    
                    const posWidget = this.widgets.find(w => w.name === "template_positive");
                    const negWidget = this.widgets.find(w => w.name === "template_negative");
                    
                    widget.inputEl.style.height = "50px"; // ← достаточно для 5 строк + кнопок
                    widget.inputEl.style.resize = "none";  // запрещаем ручное изменение
                    widget.inputEl.style.display = "none";

                    // Создаём контейнер
                    const container = document.createElement("div");
                    container.className = "prompt-template-ui";
                    container.style.padding = "6px 0";
                    container.style.minHeight = "280px";  
                    container.style.flexDirection = "column";
                    container.style.width = "100%";
                    container.style.boxSizing = "border-box";

                    container.innerHTML = `
                        <div style="font-size: 12px; color: #aaa; margin-bottom: 4px;">Variables (Key=Value pairs):</div>
                        <div class="kv-container" style="
                            display: flex;
                            flex-direction: column;
                            gap: 4px;
                            height: 180px;            /* ← Фиксированная высота */
                            overflow-y: auto;
                            border: 1px solid #444;
                            border-radius: 3px;
                            padding: 4px;
                            background: #2a2a2a;
                            width: 100%;
                            box-sizing: border-box;
                            flex-shrink: 0;
                        "></div>
                        <div style="display: flex; gap: 6px; width: 100%; margin-top: 4px;">
                            <button class="add-kv" style="
                                flex: 1;
                                padding: 2px 8px;
                                font-size: 12px;
                                background: #444;
                                color: white;
                                border: 1px solid #666;
                                border-radius: 3px;
                                cursor: pointer;
                                min-width: 80px;
                            ">+ Add Variable</button>
                            <button class="load-from-prompt" style="
                                flex: 1;
                                padding: 2px 8px;
                                font-size: 12px;
                                background: #3a5;
                                color: white;
                                border: 1px solid #5a7;
                                border-radius: 3px;
                                cursor: pointer;
                                min-width: 80px;
                            ">Load from Prompt</button>
                        </div>
                    `;
                    widget.inputEl.parentNode.appendChild(container);

                    const kvContainer = container.querySelector(".kv-container");
                    const addButton = container.querySelector(".add-kv");
                    const loadButton = container.querySelector(".load-from-prompt");

                    const extractKeys = (text) => {
                        if (!text) return [];
                        const matches = text.match(/\*([a-zA-Z_][a-zA-Z0-9_]*)/g);
                        if (!matches) return [];
                        return [...new Set(matches.map(m => m.substring(1)))];
                    };

                    const updateJSON = () => {
                        const obj = {};
                        kvContainer.querySelectorAll(".kv-pair").forEach(pair => {
                            const key = pair.querySelector(".key").value.trim();
                            const val = pair.querySelector(".value").value.trim();
                            if (key) obj[key] = val;
                        });
                        widget.value = JSON.stringify(obj, null, 2);
                        if (widget.callback) widget.callback(widget.value);
                        updateWidgetHeight(container, 300, node);
                    };

                    const createPair = (key = "", value = "") => {
                        const pair = document.createElement("div");
                        pair.className = "kv-pair";
                        pair.style.display = "flex";
                        pair.style.gap = "4px";
                        pair.style.alignItems = "center";
                        pair.style.width = "100%";

                        pair.innerHTML = `
                            <input type="text" class="key" placeholder="key" value="${key}" style="
                                flex: 1;
                                padding: 2px 4px;
                                font-size: 12px;
                                background: #333;
                                border: 1px solid #555;
                                color: white;
                                border-radius: 2px;
                                min-width: 60px;
                                max-width: 120px;
                            ">
                            <input type="text" class="value" placeholder="value" value="${value}" style="
                                flex: 2;
                                padding: 2px 4px;
                                font-size: 12px;
                                background: #333;
                                border: 1px solid #555;
                                color: white;
                                border-radius: 2px;
                                min-width: 80px;
                            ">
                            <button class="remove" style="
                                width: 20px;
                                height: 20px;
                                padding: 0;
                                font-size: 14px;
                                background: #555;
                                color: #ff6b6b;
                                border: none;
                                border-radius: 2px;
                                cursor: pointer;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                            ">×</button>
                        `;
                        kvContainer.appendChild(pair);

                        pair.querySelector(".key").addEventListener("input", updateJSON);
                        pair.querySelector(".value").addEventListener("input", updateJSON);
                        pair.querySelector(".remove").addEventListener("click", () => {
                            pair.remove();
                            updateJSON();
                        });
                    };

                    const loadFromPrompt = () => {
                        let keys = [];
                        if (posWidget?.value) keys = keys.concat(extractKeys(posWidget.value));
                        if (negWidget?.value) keys = keys.concat(extractKeys(negWidget.value));
                        keys = [...new Set(keys)];

                        kvContainer.innerHTML = "";
                        if (keys.length === 0) {
                            createPair();
                        } else {
                            keys.forEach(key => createPair(key, ""));
                        }
                        updateJSON();
                    };

                    try {
                        const current = JSON.parse(widget.value || "{}");
                        if (Object.keys(current).length === 0) {
                            createPair();
                        } else {
                            for (const [k, v] of Object.entries(current)) {
                                createPair(k, v);
                            }
                        }
                    } catch (e) {
                        createPair();
                    }

                    addButton.addEventListener("click", () => {
                        createPair();
                        updateJSON();
                    });

                    loadButton.addEventListener("click", loadFromPrompt);

                    // Первый раз растягиваем ноду
                    setTimeout(updateJSON, 50);
                };

                setTimeout(initUI, 10);

                const originalOnConfigure = this.onConfigure;
                this.onConfigure = function() {
                    if (originalOnConfigure) originalOnConfigure.apply(this, arguments);
                    setTimeout(initUI, 50);
                };
                return r;
            };
        }
    }
});
// Function to update widget height consistently
export function updateWidgetHeight(container, height, node) {
  // Update CSS variables
  container.style.setProperty('--comfy-widget-min-height', `${height}px`);
  container.style.setProperty('--comfy-widget-height', `${height}px`);
  
  // Force node to update size after a short delay to ensure DOM is updated
  if (node) {
    setTimeout(() => {
      node.setDirtyCanvas(true, true);
    }, 10);
  }
}