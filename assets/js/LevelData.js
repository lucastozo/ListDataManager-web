let mainListMaxPosition;
let extendedListMaxPosition;
function updateTable() {
    var table = document.querySelector('#level-table');

    function updateColor() {
        for (var i = 0; i < table.rows.length; i++) {
            listpctHandler(i);
            var row = table.rows[i];
            var th = row.cells[0];

            // Pintar a célula de 'posição' de acordo com a posição
            var position = parseInt(th.textContent);
            if(position <= mainListMaxPosition) {
                //striped
                if(position % 2 != 0) {
                    th.style.backgroundColor = 'rgba(173, 41, 53, 0.5)';
                } else {
                    th.style.backgroundColor = 'rgba(173, 41, 53, 0.25)';
                }
            } else if(position <= extendedListMaxPosition) {
                //striped
                if(position % 2 != 0) {
                    th.style.backgroundColor = 'rgba(135, 73, 32, 0.5)';
                } else {
                    th.style.backgroundColor = 'rgba(135, 73, 32, 0.25)';
                }
            }
        }
    }

    function listpctHandler(i) {
        var row = table.rows[i];
        var listpct = row.cells[7];
        var position = parseInt(row.cells[0].textContent);
        if(position <= mainListMaxPosition) {
            if(listpct.textContent.trim() === '') {
                listpct.textContent = 'preencher!';
            }
        } else if(position <= extendedListMaxPosition) {
            listpct.textContent = '';
        }
    }

    updateColor();
}

function IniciarLevelData(fileInput)
{
    BotoesManipuladoresLevel();
    GenerateLevelTable(fileInput);
}

function GenerateLevelTable(fileInput) {
    var file = fileInput.files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
        var fileContent = e.target.result;
        var json = JSON.parse(fileContent);
        json.Data.sort(function(a, b) {
            return a.position_lvl - b.position_lvl;
        });

        var table = document.createElement('table');
        table.className = 'table table-striped table-hover align-middle';
        table.id = 'level-table';

        var thead = document.createElement('thead');
        var tr = document.createElement('tr');
        ['Posição', 'ID', 'Nome', 'Criador', 'Verificador', 'Vídeo', 'Publicador', 'List%', 'Ações'].forEach(function(header) {
            var th = document.createElement('th');
            th.scope = 'col';
            th.style.textAlign = 'center';
            th.textContent = header;
            tr.appendChild(th);
        });
        thead.appendChild(tr);
        table.appendChild(thead);

        var tbody = document.createElement('tbody');
        fetch('/data/listvalues.json')
        .then(response => response.json())
        .then((data) => {
            mainListMaxPosition = data.Data[0].mainList;
            extendedListMaxPosition = data.Data[0].extendedList;
        json.Data.forEach(function(item, index) {
            index = index + 1;
            var tr = document.createElement('tr');
            var th = document.createElement('th');
            th.scope = 'row';
            th.textContent = item.position_lvl;
            th.style.textAlign = 'center';

            tr.appendChild(th);

            ['id_lvl', 'name_lvl', 'creator_lvl', 'verifier_lvl', 'video_lvl', 'publisher_lvl', 'listpct_lvl'].forEach(function(key) {
                var td = document.createElement('td');
                td.contentEditable = true;
                td.spellcheck = false;
                td.style.textAlign = 'center';

                // VERIFICAÇOES DE VALORES
                if (key === 'video_lvl' && item[key]) {
                    var a = document.createElement('a');
                    a.href = item[key];
                    a.textContent = item[key];
                    a.target = '_blank';
                    td.appendChild(a);
                } else {
                    if(key === 'listpct_lvl' && (index) <= mainListMaxPosition) {
                        td.textContent = item[key];
                    } else if(key === 'listpct_lvl' && (index) <= extendedListMaxPosition) {
                        td.textContent = "";
                    } else {
                        td.textContent = item[key];
                    }
                }
                //ignorar valores não numéricos para listpct
                if(key === 'listpct_lvl')
                {
                    var value = td.textContent;
                    td.oninput = function() {
                        if(isNaN(this.textContent) || this.textContent < 0 || this.textContent > 100)
                        {
                            this.textContent = value;
                        }
                        else
                        {
                            value = this.textContent;
                        }
                    }
                }
                tr.appendChild(td);
            });
            var td = document.createElement('td');
            td.style.textAlign = 'center';

            // deletar
            var deleteButton = createDeleteButton(table, tr);
            td.appendChild(deleteButton);

            // atualizar
            var refreshButton = createRefreshButton(tr);
            td.appendChild(refreshButton);

            // diminuir posição
            var downButton = createDownButton(table, tr);
            td.appendChild(downButton);

            // aumentar posição
            var upButton = createUpButton(table, tr);
            td.appendChild(upButton);

            tr.appendChild(td);
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        document.body.appendChild(table);
        //adicionar na div table-container
        var tableContainer = document.getElementById('table-container');
        tableContainer.appendChild(table);
        setTimeout(updateTable, 0);
        });
    };
    reader.readAsText(file);
}

function DeletarLinhaLevelTable(table, rowIndex) {
    var levelPosition = table.rows[rowIndex].cells[0].textContent;
    var levelName = table.rows[rowIndex].cells[1].textContent;
    var levelCreator = table.rows[rowIndex].cells[2].textContent;
    var levelVerifier = table.rows[rowIndex].cells[3].textContent;
    var confirmMessage = "O seguinte level será EXCLUÍDO: \n" +
                        "\nPosição: " + levelPosition + 
                        "\nNome: " + levelName + 
                        "\nCriador: " + levelCreator + 
                        "\nVerificador: " + levelVerifier +
                        "\n\nEXCLUIR?";
    if(confirm(confirmMessage)) {
        table.deleteRow(rowIndex);
        //para cada linha onde posição é maior que a posição do level excluído, diminuir 1
        for(var i = rowIndex; i < table.rows.length; i++)
        {
            table.rows[i].cells[0].textContent = i;
        }
        updateTable();
    }
}

function BotoesManipuladoresLevel()
{
    var buttonsManip = document.getElementById('botoes-manipuladores-container');
    
    var addButton = document.createElement('button');
    addButton.innerHTML = '<i class="fas fa-plus"></i> Adicionar Level';
    addButton.className = 'btn btn-success';
    addButton.style.margin = '5px';
    addButton.setAttribute('data-bs-toggle', 'modal');
    addButton.setAttribute('data-bs-target', '#addLevel-modal');
    buttonsManip.appendChild(addButton);
    var addLevelButton  = document.querySelector('#addLevel');
    addLevelButton.onclick = function() {
        var position = document.querySelector('#level-position').value;
        var id = document.querySelector('#level-id-level').value;
        var name = document.querySelector('#level-name').value;
        var creator = document.querySelector('#level-creator').value;
        var verifier = document.querySelector('#level-verifier').value;
        var video = document.querySelector('#level-video').value;
        var publisher = document.querySelector('#level-publisher').value;
        var listpct = document.querySelector('#level-listpct').value;
        AdicionarLevel(position, id, name, creator, verifier, video, publisher, listpct);
    }

    var exportButton = document.createElement('button');
    exportButton.innerHTML = '<i class="fas fa-file-export"></i> Exportar JSON';
    exportButton.className = 'btn btn-primary';
    exportButton.style.margin = '5px';
    exportButton.onclick = function() {
        var table = document.getElementById('level-table');
        var json = ExportarLevel(table);
        DownloadLevelJSON(json);
    }
    buttonsManip.appendChild(exportButton);

    var refreshButton = document.createElement('button');
    refreshButton.innerHTML = '<i class="fas fa-sync"></i> Atualizar Tudo';
    refreshButton.className = 'btn btn-warning';
    refreshButton.style.margin = '5px';
    refreshButton.onclick = function() {
        RefreshAll();
    }
    buttonsManip.appendChild(refreshButton);
}

async function AdicionarLevel(position, id, name, creator, verifier, video, publisher, listpct)
{
    if(!await checarInputs()) {
        return;
    }
    async function checarInputs() {
        if(position === '' || id === '' || name === '' || creator === '' || verifier === '' || video === '')
        {
            alert('Preencha todos os campos!');
            return false;
        }
        else if(position < 1 || position > document.querySelector('#level-table').rows.length)
        {
            alert('Posição inválida. Insira um valor entre 1 e ' + document.querySelector('#level-table').rows.length + '.');
            return false;
        }
        if(await checkLevelId(id)){
            //se o level já existe, não adicionar
            var table = document.querySelector('#level-table');
            var idExists = false;
            //verificar se o id já existe percorrendo a tabela
            for (var i = 0; i < table.rows.length; i++) {
                var row = table.rows[i];
                var currentId = row.cells[1].textContent;
                if (currentId == id) {
                    idExists = true;
                    break;
                }
            }
            if (idExists) {
                alert('O level com o ID ' + id + ' já existe!');
                return false;
            }
        } else {
            alert('ID inválido. Verifique se o ID está correto e se o level existe.');
            return false;
        }
        return true;
    }

    var table = document.querySelector('#level-table');
    for(var i = table.rows.length - 1; i >= position; i--)
    {
        var row = table.rows[i];
        var currentPosition = parseInt(row.cells[0].textContent);
        if(currentPosition >= position)
        {
            row.cells[0].textContent = currentPosition + 1;
        }
    }
    
    function createCell(row, text, isEditable, isLink = false) {
        var cell = row.insertCell();
        cell.textContent = text;
        cell.contentEditable = isEditable;
    
        if (isLink && text) {
            var a = document.createElement('a');
            a.href = text;
            a.textContent = text;
            a.target = '_blank';
            a.style.cursor = 'pointer';
            cell.textContent = '';
            cell.appendChild(a);
        }
    
        return cell;
    }
    
    var rowIndex = parseInt(position);
    var newRow = table.insertRow(rowIndex);
    newRow.spellcheck = false;
    
    createCell(newRow, position, false);
    createCell(newRow, id, true);
    createCell(newRow, name, true);
    createCell(newRow, creator, true);
    createCell(newRow, verifier, true);
    createCell(newRow, video, true, true);
    createCell(newRow, publisher, true);
    createCell(newRow, listpct, true);
    var actionsCell = newRow.insertCell();

    // deletar
    var deleteButton = createDeleteButton(table, newRow);
    actionsCell.appendChild(deleteButton);

    // atualizar
    var refreshButton = createRefreshButton(newRow);
    actionsCell.appendChild(refreshButton);

    // diminuir posição
    var downButton = createDownButton(table, newRow);
    actionsCell.appendChild(downButton);

    // aumentar posição
    var upButton = createUpButton(table, newRow);
    actionsCell.appendChild(upButton);

    document.querySelector('#level-position').value = '';
    document.querySelector('#level-id-level').value = '';
    document.querySelector('#level-name').value = '';
    document.querySelector('#level-creator').value = '';
    document.querySelector('#level-verifier').value = '';
    document.querySelector('#level-video').value = '';
    document.querySelector('#level-publisher').value = '';
    document.querySelector('#level-listpct').value = '';
    updateTable();

    var modal = document.querySelector('#addLevel-modal');
    var modalBS = bootstrap.Modal.getInstance(modal);
    modalBS.hide();
}

//exportar tabela para json
function ExportarLevel(table)
{
    var date = new Date();
    var day = date.getDate();
    var month = date.getMonth() + 1; //January is 0
    var year = date.getFullYear();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();
    var generatedAt = day + '/' + month + '/' + year + ' ' + hour + ':' + minute + ':' + second;
    var json = {GeradoEm: generatedAt, TipoData: "level", Data: []};
    for(var i = 1; i < table.rows.length; i++)
    {
        var level = {};
        level.position_lvl = parseInt(table.rows[i].cells[0].textContent);
        level.id_lvl = table.rows[i].cells[1].textContent;
        level.name_lvl = table.rows[i].cells[2].textContent;
        level.creator_lvl = table.rows[i].cells[3].textContent;
        level.verifier_lvl = table.rows[i].cells[4].textContent;
        level.video_lvl = table.rows[i].cells[5].textContent;
        var publisher = table.rows[i].cells[6].textContent;
        if(publisher && publisher.trim() !== '')
        {
            level.publisher_lvl = publisher;
        }
        var listpct = table.rows[i].cells[7].textContent;
        if(!isNaN(listpct) && listpct.trim() !== '' && listpct >= 0 && listpct <= 100 && listpct !== 'preencher!')
        {
            level.listpct_lvl = parseInt(listpct);
        }
        json.Data.push(level);
    }
    return json;
}

function DownloadLevelJSON(json)
{
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json, null, 2));
    var dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "NEWleveldata.json");
    dlAnchorElem.click();
}

async function RefreshAll()
{
    var confirmMessage = "Tem certeza que deseja atualizar todos os nomes e criadores?\n\n" +
                        "A atualização irá reescrever o nome de todos os levels e seus criadores para os nomes atuais no Geometry Dash.\n" +
                        "Isso pode causar alterações indesejadas, por favor, revise a tabela depois de atualizar.\n\n" +
                        "\nATUALIZAR?";
    if(!confirm(confirmMessage)) {
        return;
    }
    var table = document.querySelector('#level-table');
    document.getElementById('overlay').style.display = 'flex';
    for(var i = 1; i < table.rows.length; i++)
    {
        loadingSpinnerLabel = document.getElementById('loading-spinner-label');
        loadingSpinnerLabel.textContent = i + '/' + (table.rows.length - 1);
        var levelId = table.rows[i].cells[1].textContent;
        if(levelId && levelId.trim() !== '')
        {
            try{
                var data = await getLevelInfo(levelId);
                if(data)
                {
                    table.rows[i].cells[2].textContent = data.name;
                    //se não tiver publisher, atualizar creator
                    if(table.rows[i].cells[6].textContent.trim() === '')
                    {
                        table.rows[i].cells[3].textContent = data.author;
                    }
                    else
                    {
                        table.rows[i].cells[6].textContent = data.author;
                    }
                }
            } catch (error) {
                alert(error);
            }
        }
    }
    document.getElementById('overlay').style.display = 'none';
}

function createDeleteButton(table, tr) {
    var deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
    deleteButton.className = 'btn btn-danger';
    deleteButton.style.margin = '5px';
    deleteButton.setAttribute('data-bs-toggle', 'tooltip');
    deleteButton.setAttribute('data-bs-placement', 'top');
    deleteButton.setAttribute('title', 'Deletar level');
    deleteButton.onclick = function() {
        DeletarLinhaLevelTable(table, tr.rowIndex);
    }
    return deleteButton;
}

function createRefreshButton(tr) {
    var refreshButton = document.createElement('button');
    refreshButton.innerHTML = '<i class="fas fa-sync"></i>';
    refreshButton.className = 'btn btn-primary';
    refreshButton.style.margin = '5px';
    refreshButton.setAttribute('data-bs-toggle', 'tooltip');
    refreshButton.setAttribute('data-bs-placement', 'top');
    refreshButton.setAttribute('title', 'Atualizar nome e criador');
    refreshButton.onclick = async function() {
        var levelId = tr.cells[1].textContent;
        if(levelId && levelId.trim() !== '') {
            try {
                refreshButton.innerHTML = '<span class="spinner-border spinner-border-sm" aria-hidden="true"></span><span class="visually-hidden">Loading...</span>';
                refreshButton.disabled = true;
                var data = await getLevelInfo(levelId);
                if(data) {
                    tr.cells[2].textContent = data.name;
                    if(tr.cells[6].textContent.trim() === '') {
                        tr.cells[3].textContent = data.author;
                    } else {
                        tr.cells[6].textContent = data.author;
                    }
                }
            } catch (error) {
                alert(error);
            }
        }
        refreshButton.innerHTML = '<i class="fas fa-sync"></i>';
        refreshButton.disabled = false;
    }
    return refreshButton;
}

function createDownButton(table, tr) {
    var downButton = document.createElement('button');
    downButton.innerHTML = '<i class="fas fa-arrow-down"></i>';
    downButton.className = 'btn btn-dark';
    downButton.style.margin = '5px';
    downButton.style.borderColor = '#6a767f';
    //tooltip
    downButton.setAttribute('data-bs-toggle', 'tooltip');
    downButton.setAttribute('data-bs-placement', 'top');
    downButton.setAttribute('title', 'Diminuir posição');
    downButton.onclick = function() {
        if(tr.rowIndex < table.rows.length - 1)
        {
            var linhaPosterior = table.rows[tr.rowIndex + 1];
            var posicaoPosterior = linhaPosterior.cells[0].textContent;
            linhaPosterior.cells[0].textContent = tr.cells[0].textContent;
            tr.cells[0].textContent = posicaoPosterior;
            table.tBodies[0].insertBefore(tr, linhaPosterior.nextSibling);

            updateTable();
        }
    }
    return downButton;
}

function createUpButton(table, tr) {
    var upButton = document.createElement('button');
    upButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    upButton.className = 'btn btn-dark';
    upButton.style.margin = '5px';
    upButton.style.borderColor = '#6a767f';
    //tooltip
    upButton.setAttribute('data-bs-toggle', 'tooltip');
    upButton.setAttribute('data-bs-placement', 'top');
    upButton.setAttribute('title', 'Aumentar posição');
    upButton.onclick = function() {
        if(tr.rowIndex > 1)
        {
            var linhaAnterior = table.rows[tr.rowIndex - 1];
            var posicaoAnterior = linhaAnterior.cells[0].textContent;
            linhaAnterior.cells[0].textContent = tr.cells[0].textContent;
            tr.cells[0].textContent = posicaoAnterior;
            table.tBodies[0].insertBefore(tr, linhaAnterior);
            
            updateTable();
        }
    }
    return upButton;
}