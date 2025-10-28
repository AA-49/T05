d3.csv("data/Ex5_TV_energy.csv").then(raw => {
    const data = raw.map(d => ({
        brand: d.brand,
        tech: d.screen_tech,
        screensize: +d.screensize,
        energy: +d.energy_consumpt,
        star: +d.star2,
        count: +d.count
    })).filter(d => Number.isFinite(d.screensize) && Number.isFinite(d.energy));

    createScatterPlot(data);
});

const createScatterPlot = (data) => {
    const margin = { top: 20, right: 140, bottom: 50, left: 60 };
    const width = 700;
    const height = 440;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select("#scatter-plot")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.screensize)).nice()
        .range([0, innerWidth]);

    const y = d3.scaleLinear()
        .domain(d3.extent(data, d => d.energy)).nice()
        .range([innerHeight, 0]);

    const techs = Array.from(new Set(data.map(d => d.tech)));
    const color = d3.scaleOrdinal()
        .domain(techs)
        .range(techs.length <= 3 ? ["red", "yellow", "blue"] : d3.schemeTableau10);

    const rScale = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.count || 1)])
        .range([3, 12]);

    // axes
    g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x).ticks(8));

    g.append("g")
        .call(d3.axisLeft(y));

    // labels
    svg.append("text")
        .attr("x", margin.left + innerWidth / 2)
        .attr("y", height - 6)
        .attr("text-anchor", "middle")
        .text("Screen size (inches)");

    svg.append("text")
        .attr("transform", `translate(14, ${margin.top + innerHeight / 2}) rotate(-90)`)
        .attr("text-anchor", "middle")
        .text("Energy consumption (kWh/year)");

    // points
    const pts = g.selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", d => x(d.screensize))
        .attr("cy", d => y(d.energy))
        .attr("r", d => rScale(d.count || 1))
        .attr("fill", d => color(d.tech))
        .attr("fill-opacity", 0.85)
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.8);

    // simple tooltip using title
    pts.append("title")
        .text(d => `${d.brand} — ${d.tech}\nSize: ${d.screensize} in\nEnergy: ${d.energy.toFixed(1)} kWh/year\nCount: ${d.count}`);

    // legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - margin.right + 10}, ${margin.top})`);
    techs.forEach((t, i) => {
        const row = legend.append("g").attr("transform", `translate(0, ${i * 20})`);
        row.append("rect").attr("width", 12).attr("height", 12).attr("fill", color(t));
        row.append("text").attr("x", 16).attr("y", 10).text(t).style("font-size", "12px").attr("fill", "#222");
    });
};
