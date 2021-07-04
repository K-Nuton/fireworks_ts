import Fireworks from "./fireworks";

window.addEventListener('load', () => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    
    const fireworks = new Fireworks({
        width: window.innerWidth,
        height: window.innerHeight,
        amount: 5
    });

    fireworks.dom.style.display = "block";
    fireworks.dom.style.top = "0";
    fireworks.dom.style.left = "0";
    document.body.appendChild(fireworks.dom);

    fireworks.start();

    let id: NodeJS.Timeout;
    window.addEventListener('resize', () => {
        clearTimeout(id);

        id = setTimeout(() => {
            fireworks.resize(window.innerWidth, window.innerHeight);
            fireworks.start();
        }, 500);
    });
});