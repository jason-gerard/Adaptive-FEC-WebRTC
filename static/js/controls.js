let startTime = Date.now();

const names = ["Standard", "Corrected", "CorrectedML"];
const metrics = ["frameCount", "frameDisplayed", "errorCountBC", "errorCountAC", "dataPacketCount", "overheadPacketCount"];

function resetSim() {
    for (let name of names) {
        for (let metric of metrics) {
            const count = document.getElementById(metric + name);
            count.innerHTML = "0";
        }
    }

    for (let name of names) {
        const el = document.getElementById(`delay${name}`);
        el.innerHTML = "";
    }

    document.getElementById("nList").innerHTML = "";

    startTime = Date.now();
}

function saveResults() {
    let csv = "";
    csv += ["Name"].concat(metrics).join(",") + "\n";
    for (let name of names) {
        let line = [name];
        for (let metric of metrics) {
            const count = document.getElementById(metric + name);
            line.push(count.innerHTML);
        }
        
        csv += line.join(",") + "\n";
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime; // milliseconds
    
    csv += "\n";
    csv += `duration,${duration}`;
    
    const nList = document.getElementById("nList").innerHTML;

    csv += "\n";
    csv += `nList,${nList}`;

    for (let name of names) {
        const delays = document.getElementById(`delay${name}`).innerHTML;
        csv += "\n";
        csv += `${name},${delays}`;
    }

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', `results_${+new Date()}.csv`);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function timedRun() {
    const duration = 30 * 1000;

    resetSim();
    
    setTimeout(() => {
        saveResults();
        resetSim();
    }, duration);
}