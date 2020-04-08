// import { expect } from 'chai';
// import 'mocha';
// import { SerializedEventHandler, RendererEventHandler } from './EventHandler';
// import { SerializableEvent } from './EventTypes';

// const TEST_EVENT_TYPE = 'test.event';

// class TestEvent extends SerializableEvent {
//     constructor(name: string, public text: string, public number: number) {
//         super(name);
//     }
// }

// const TEST_EVENT_PAYLOAD = `{"name": "${TEST_EVENT_TYPE}", "text": "testText", "number": 4712}`;

// describe('Event Handler Test', () => {

//     let events: SerializedEventHandler;

//     beforeEach(() => {
//         events = new SerializedEventHandler();
//     });

// 	it('Should handle a serialized event', () => {
//         // given
//         let applyEvent: TestEvent | undefined;
//         const handler = new (class TestHandler extends RendererEventHandler<TestEvent> {
//             getName(): string {
//                 return TEST_EVENT_TYPE;
//             }
//             apply(event: TestEvent, renderer: Renderer): void {
//                 applyEvent = event;
//             }
//         });
//         events.registerHandler(handler);

//         // when
//         events.handleSerializedEvent(TEST_EVENT_PAYLOAD);

//         // then
//         expect(applyEvent).not.to.be.undefined;
//         expect(applyEvent).to.deep.equal({
//             name: TEST_EVENT_TYPE,
//             text: 'testText',
//             number: 4712
//         });

//     });
    
// });
