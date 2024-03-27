// erd/JointJSEditor.js
import * as joint from "jointjs";
import { Vectorizer } from "jointjs";
export const exportGraph = (graph) => {
  if (!graph) {
    console.error("No graph instance provided for export.");
    return;
  }
  const graphJson = graph.toJSON();
  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(graphJson));
  const downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "erd.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

const JointJSEditor = (container, openModalCallback, onElementClick) => {
  var graph = new joint.dia.Graph({}, { cellNamespace: joint.shapes });
  var paper = new joint.dia.Paper({
    el: container,
    model: graph,
    width: "100%",
    height: "600px",
    gridSize: 10,
    background: {
      color: "rgba(0, 255, 0, 0.3)",
    },
    interactive: true,
  });

  paper.on("element:pointerdblclick", openModalCallback);

  paper.on("element:pointerclick", function (elementView) {
    if (typeof onElementClick === "function") {
      const model = elementView.model;
      onElementClick(model.id);
    }
  });

  const counters = {
    Entity: 0,
    Relationship: 0,
    CustomShape: 0,
  };

  const findElementsToLink = () => {
    const elements = graph.getElements();
    const linksToCreate = [];

    elements.forEach((element) => {
      const elementProps = element.prop("customProperties") || [];

      const elementPropValues = elementProps.map((prop) => prop.value);

      elements.forEach((compareElement) => {
        if (element.id === compareElement.id) {
          return;
        }

        const compareProps = compareElement.prop("customProperties") || [];
        const comparePropValues = compareProps.map((prop) => prop.value);

        // Accumulate shared properties
        const sharedProperties = elementProps.filter((prop) =>
          comparePropValues.includes(prop.value)
        );

        if (sharedProperties.length) {
          // Check if a link for these elements already exists in linksToCreate
          const existingLinkIndex = linksToCreate.findIndex(
            (link) =>
              (link.source === element.id &&
                link.target === compareElement.id) ||
              (link.source === compareElement.id && link.target === element.id)
          );

          if (existingLinkIndex > -1) {
            // If a link exists, append new shared properties to it
            linksToCreate[existingLinkIndex].properties = [
              ...linksToCreate[existingLinkIndex].properties,
              ...sharedProperties,
            ];
          } else {
            // If no link exists, create a new one
            linksToCreate.push({
              source: element.id,
              target: compareElement.id,
              properties: sharedProperties,
            });
          }
        }
      });
    });

    return linksToCreate;
  };

  const createShape = (type, position, size, label, description, color, id) => {
    let shape;
    if (type === "Rect") {
      shape = new joint.shapes.basic.Rect({
        position,
        size,
        attrs: {
          rect: { fill: color },
          text: { text: label, fill: "white" },
        },
        description: description,
        id: id,
      });
    } else if (type === "Circle") {
      shape = new joint.shapes.basic.Circle({
        position,
        size,
        attrs: {
          circle: { fill: color },
          text: { text: label, fill: "white" },
        },
        description: description,
        id: id,
      });
    }
    return shape;
  };

  const addElement = (type) => {
    counters[type] = (counters[type] || 0) + 1;
    const id = joint.util.uuid();
    const defaultName = `${type} ${counters[type]}`;

    console.log(id);

    let element;
    if (type === "Entity") {
      element = createShape(
        "Rect",
        { x: 100, y: 100 },
        { width: 100, height: 30 },
        defaultName,
        "Description",
        "blue",
        id
      );
    } else if (type === "Relationship") {
      element = createShape(
        "Circle",
        { x: 300, y: 100 },
        { width: 50, height: 30 },
        defaultName,
        "Description",
        "red",
        id
      );
    } else if (type === "CustomShape") {
      element = createShape(
        "Rect",
        { x: 500, y: 100 },
        { width: 150, height: 50 },
        defaultName,
        "Description",
        "green",
        id
      );
    }

    graph.addCell(element);
    console.log(element);
  };

  const removeElement = (id) => {
    const cell = graph.getCell(id);
    if (cell) {
      cell.remove();
    }
  };

  const createLinksForSharedProperties = () => {
    const linksToCreate = findElementsToLink();

    linksToCreate.forEach(({ source, target, properties }) => {
      const uniqueProperties = [
        ...new Map(properties.map((prop) => [prop.value, prop])).values(),
      ];

      const sharedPropertiesText = uniqueProperties
        .map((prop) => `${prop.key}: ${prop.value}`)
        .join("\n");

      const link = new joint.dia.Link({
        source: { id: source },
        target: { id: target },
        attrs: {
          ".connection": { stroke: "blue", "stroke-width": 2 },
          ".marker-target": { fill: "blue", d: "M 10 0 L 0 5 L 10 10 z" },
          ".connection-wrap": { display: "none" },
        },
        labels: [
          {
            attrs: {
              text: {
                text: "",
                "font-size": 12,
                "font-family": "Arial, sans-serif",
              },
              rect: {
                fill: "#f7f7f7",
                stroke: "#333",
                "stroke-width": 1,
                "ref-x": 0.5,
                "ref-y": 0.5,
              },
            },
            position: {
              distance: 0.5,
            },
          },
        ],
      });

      graph.addCell(link);

      paper.on("link:mouseenter", function (linkView) {
        if (
          linkView.model === link &&
          linkView.model.label(0).attrs.text.text === ""
        ) {
          var textElement = Vectorizer("text", {
            "font-size": "15px",
            "font-family": "Arial, sans-serif",
            text: sharedPropertiesText,
          });

          Vectorizer(paper.svg).append(textElement);

          var bbox = textElement.bbox();

          textElement.remove();

          link.label(0, {
            attrs: {
              text: { text: sharedPropertiesText },
              rect: {
                ...link.label(0).attrs.rect,
                width: bbox.width + 30,
                height: bbox.height + 30,
              },
            },
          });
          linkView.showTools();
        }
      });

      paper.on("link:mouseleave", function (linkView) {
        if (linkView.model === link) {
          link.label(0, {
            attrs: { text: { text: "" }, rect: { fill: "none" } },
          });
          linkView.hideTools();
        }
      });
    });
  };

  return { graph, addElement, removeElement, createLinksForSharedProperties };
};

export default JointJSEditor;
