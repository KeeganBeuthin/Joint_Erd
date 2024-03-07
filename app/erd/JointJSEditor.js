// erd/JointJSEditor.js
import * as joint from "jointjs";

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

const JointJSEditor = (container, openModalCallback) => {
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

  const createShape = (
    type,
    position,
    size,
    label,
    description,
    color = "green"
  ) => {
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
      });
    }

    return shape;
  };

  const addElement = (type) => {
    let element;

    if (type === "Entity") {
      element = createShape(
        "Rect",
        { x: 100, y: 100 },
        { width: 100, height: 30 },
        "Entity",
        "Description",
        "blue"
      );
    } else if (type === "Relationship") {
      element = createShape(
        "Circle",
        { x: 300, y: 100 },
        { width: 50, height: 30 },
        "Rel",
        "red",
        "red"
      );
    } else if (type === "CustomShape") {
      element = createShape(
        "Rect",
        { x: 500, y: 100 },
        { width: 150, height: 50 },
        "Custom Shape"
      );
    }

    graph.addCell(element);
  };

  return { graph, addElement };
};

export default JointJSEditor;
