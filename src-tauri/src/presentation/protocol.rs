use serde::{Deserialize, Serialize};
use specta::Type;
use ulid::Ulid;

#[derive(Type, Debug, Default, Clone, Serialize, Deserialize)]
pub struct Candidate {
    pub kind: String,
    pub label: String,
}

#[derive(Type, Debug, Default, Clone, Serialize, Deserialize)]
pub struct Editor {
    pub nodes: Vec<Node>,
    pub edges: Vec<Edge>,
}

impl Editor {
    pub fn add_edge(
        &mut self,
        source: String,
        target: String,
        source_handle: String,
        target_handle: String,
    ) {
        self.edges.push(Edge {
            id: Ulid::new().to_string(),
            label: None,
            source,
            target,
            source_handle,
            target_handle,
            data: EdgeData::default(),
        });
    }

    pub fn remove_edge(
        &mut self,
        source: String,
        target: String,
        source_handle: String,
        target_handle: String,
    ) {
        self.edges
            .iter()
            .position(|e| {
                e.source == source
                    && e.target == target
                    && e.source_handle == source_handle
                    && e.target_handle == target_handle
            })
            .map(|i| self.edges.remove(i));
    }

    pub fn set_assignment(&mut self, id: String, assignment: Assignment) {
        let Some(mut edge) = self.edges.iter_mut().find(|e| e.id == id) else {
            return;
        };
        edge.data.assignment = assignment;
    }
}

#[allow(clippy::from_over_into)]
impl Into<crate::model::Pipeline> for Editor {
    fn into(self) -> crate::model::Pipeline {
        crate::model::Pipeline {
            components: self.nodes.into_iter().map(|n| n.into()).collect(),
            connections: self.edges.into_iter().map(|n| n.into()).collect(),
        }
    }
}

#[derive(Type, Debug, Default, Clone, Serialize, Deserialize)]
pub struct Node {
    pub id: String,
    #[serde(rename = "type")]
    pub kind: String,
    pub position: Position,
    pub data: NodeData,
}

#[allow(clippy::from_over_into)]
impl Into<crate::model::Component> for Node {
    fn into(self) -> crate::model::Component {
        crate::model::Component {
            id: self.id,
            kind: crate::model::Kind(self.kind),
            inputs: self.data.inputs.into_iter().map(|n| n.into()).collect(),
            outputs: self.data.outputs.into_iter().map(|n| n.into()).collect(),
        }
    }
}

#[derive(Type, Debug, Default, Clone, Serialize, Deserialize)]
pub struct Position {
    pub x: f64,
    pub y: f64,
}

#[derive(Type, Debug, Default, Clone, Serialize, Deserialize)]
pub struct NodeData {
    pub label: String,
    pub inputs: Vec<InputPort>,
    pub outputs: Vec<OutputPort>,
}

#[derive(Type, Debug, Default, Clone, Serialize, Deserialize)]
pub struct Edge {
    pub id: String,
    pub label: Option<String>,
    pub source: String,
    pub target: String,
    #[serde(rename = "sourceHandle")]
    pub source_handle: String,
    #[serde(rename = "targetHandle")]
    pub target_handle: String,
    pub data: EdgeData,
}

#[derive(Type, Debug, Default, Clone, Serialize, Deserialize)]
pub struct EdgeData {
    pub assignment: Assignment,
}

#[allow(clippy::from_over_into)]
impl Into<crate::model::Connection> for Edge {
    fn into(self) -> crate::model::Connection {
        crate::model::Connection {
            id: self.id,
            source: crate::model::InputPortID {
                parent: self.source,
                name: self.source_handle,
            },
            target: crate::model::OutputPortID {
                parent: self.target,
                name: self.target_handle,
            },
            assignment: self.data.assignment,
        }
    }
}

pub type Argument = String;
pub type PropertyName = String;
pub type Assignment = std::collections::HashMap<Argument, PropertyName>;

#[derive(Type, Debug, Default, Clone, Serialize, Deserialize)]
pub struct InputPort {
    pub parent: String,
    pub name: String,
    #[serde(rename = "propertyNames")]
    pub property_names: Vec<PropertyName>,
}

impl From<crate::model::InputPort> for InputPort {
    fn from(v: crate::model::InputPort) -> InputPort {
        InputPort {
            parent: v.id.parent,
            name: v.id.name,
            property_names: v.property_names,
        }
    }
}

#[allow(clippy::from_over_into)]
impl Into<crate::model::InputPort> for InputPort {
    fn into(self) -> crate::model::InputPort {
        crate::model::InputPort {
            id: crate::model::InputPortID {
                parent: self.parent,
                name: self.name,
            },
            property_names: self.property_names,
        }
    }
}

#[derive(Type, Debug, Default, Clone, Serialize, Deserialize)]
pub struct OutputPort {
    pub parent: String,
    pub name: String,
    #[serde(rename = "propertyNames")]
    pub property_names: Vec<PropertyName>,
}

impl From<crate::model::OutputPort> for OutputPort {
    fn from(v: crate::model::OutputPort) -> OutputPort {
        OutputPort {
            parent: v.id.parent,
            name: v.id.name,
            property_names: v.property_names,
        }
    }
}

#[allow(clippy::from_over_into)]
impl Into<crate::model::OutputPort> for OutputPort {
    fn into(self) -> crate::model::OutputPort {
        crate::model::OutputPort {
            id: crate::model::OutputPortID {
                parent: self.parent,
                name: self.name,
            },
            property_names: self.property_names,
        }
    }
}
