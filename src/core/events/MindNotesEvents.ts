// import { AddNodeEvent, SerializableEvent, EditNodeEvent } from "./EventTypes";

// export type EventNodeType = EventContainer | ConcreteEvent;

// export interface EventNode {
//     name: string;
// }

// /**
//  * Parent of several EventNodes.
//  */
// export interface EventContainer extends EventNode {
//     events: EventNodeType[];
// }

// /**
//  * A concrete Event that can be emitted.
//  */
// export interface ConcreteEvent extends EventNode {
//     name: string;
// }

// export const MindNotesEvents: EventNodeType = {
//     name: 'root',
//     events: [{
//         name: 'node',
//         events: [{
//             name: 'add'
//         }, {
//             name: 'edit'
//         }, {
//             name: 'delete'
//         }]
//     }]
// };

// export const EventTypes = {
//     root: {
//         add: AddNodeEvent
//     }
// };

// export interface ITypeEvents {
//     root: {
//         add: AddNodeEvent
//     }
// };



// export class EventNodeBuilder {

//     container(name: string): EventNodeBuilder {

//     }

//     event(name: string): EventNodeBuilder {

//     }

//     build(): EventNode {

//     }
//     emit(): EventNode {

//     }

// }

// let eventBuilder = new EventNodeBuilder();
// eventBuilder
//     .container('node')
//         .event('add')
//         .event('edit')
//         .event('delete')
//     .build();

// export class EventEmitter {
//     emit<T extends SerializableEvent, K extends T>(event: T, data: K) {

//     }
// }

// let eventEmitter = new EventEmitter();
// eventEmitter.emit(EventTypes.root.add, new AddNodeEvent(1, 2, 'asdf'));

// => CREATE EVENTS MAP and the emitter walks through the event tree to fire the appropriate event
