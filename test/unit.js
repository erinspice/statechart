try {
    _ = require('underscore');
    Statechart = require('../lib/statechart');
    expect = require('expect.js');
    sinon = require('sinon');
} catch (e) {}

describe("a state", function() {
    var fsm;
    var params;
    var aEntrySpy, aExitSpy, cEntrySpy, cExitSpy;

    beforeEach(function () {
        aEntrySpy = sinon.spy();
        aExitSpy = sinon.spy();
        cEntrySpy = sinon.spy();
        cExitSpy = sinon.spy();

        params = {
            initialState: "A",
            states: {
                A: {
                    entry: aEntrySpy,
                    exit: aExitSpy,
                    goA: { target: "A" },
                    goB: { target: "B" },
                    goC: { target: "C" }
                },
                C: {
                    entry: cEntrySpy,
                    exit: cExitSpy,
                    goA: { target: "A" },
                }
            }
        };

        fsm = _.extend(params, Statechart);
        fsm.run();
    });

    describe("when it exists", function() {
        it("can be reached", function () {
            expect(fsm.currentState().name).to.equal('A');
        });

        it("runs the 'entry' event", function () {
            expect(aEntrySpy.called).to.equal(true);
        });

        describe("when transitioning to another state", function () {

            beforeEach(function () {
                fsm.dispatch('goC');
            });

            it("moves to the right state", function () {
                expect(fsm.currentState().name).to.equal('C');
            });

            it("it fires the last state's exit event", function () {
                expect(aExitSpy.called).to.equal(true);
            });

            it("it fires the new state's entry event", function () {
                expect(cEntrySpy.called).to.equal(true);
            });

            describe("when transitioning back", function () {
                beforeEach(function () {
                    fsm.dispatch('goA');
                });

                it("moves to the right state", function () {
                    expect(fsm.currentState().name).to.equal('A');
                });

                it("it fires the last state's exit event", function () {
                    expect(cExitSpy.called).to.equal(true);
                });

                it("it fires the new state's entry event", function () {
                    expect(aEntrySpy.callCount).to.equal(2);
                });

                describe("when transitioning to the other state again", function () {
                    beforeEach(function () {
                        fsm.dispatch('goC');
                    });

                    it("moves to the right state", function () {
                        expect(fsm.currentState().name).to.equal('C');
                    });

                    it("it fires the last state's exit event", function () {
                        expect(aExitSpy.callCount).to.equal(2);
                    });

                    it("it fires the new state's entry event", function () {
                        expect(cEntrySpy.callCount).to.equal(2);
                    });

                    describe("when transitioning back", function () {
                        beforeEach(function () {
                            fsm.dispatch('goA');
                        });

                        it("moves to the right state", function () {
                            expect(fsm.currentState().name).to.equal('A');
                        });

                        it("it fires the last state's exit event", function () {
                            expect(cEntrySpy.callCount).to.equal(2);
                        });

                        it("it fires the new state's entry event", function () {
                            expect(aEntrySpy.callCount).to.equal(3);
                        });
                    });
                });
            });
        });
    });

    describe("when it does not exist", function() {
        var error, err;

        beforeEach(function () {
            try {
                fsm.dispatch('goB');
            } catch (err) {
                error = err;
            }
        });

        it("throws an error", function () {
            expect(error).to.be.ok;
        });

        it("does not exit the previous state", function () {
            expect(aExitSpy.called).to.equal(false);
        });
    });

    describe("when built-in event `init` when dispatched manually", function () {
        beforeEach(function () {
            fsm.dispatch('init');
        });

        it("doesn't exit the state", function () {
            expect(aExitSpy.called).to.equal(false);
        });

        it("doesn't enter the state state again", function () {
            expect(aEntrySpy.callCount).to.equal(1);
        });

        it("still has the right state name", function () {
            expect(fsm.currentState().name).to.equal('A');
        });
    });

    describe("when built-in event `entry` when dispatched manually", function () {
        beforeEach(function () {
            fsm.dispatch('entry');
        });

        it("doesn't exit the state", function () {
            expect(aExitSpy.called).to.equal(false);
        });

        it("enters the state state again", function () {
            expect(aEntrySpy.callCount).to.equal(2);
        });

        it("still has the right state name", function () {
            expect(fsm.currentState().name).to.equal('A');
        });
    });

    describe("when built-in event `exit` when dispatched manually", function () {
        beforeEach(function () {
            fsm.dispatch('exit');
        });

        it("exits the state", function () {
            expect(aExitSpy.called).to.equal(true);
        });

        it("doesn't enter the state state again", function () {
            expect(aEntrySpy.callCount).to.equal(1);
        });

        it("doesn't change state", function () {
            expect(fsm.currentState().name).to.equal('A');
        });
    });
});

describe("an fsm with nested states", function() {
    var fsm;
    var params;
    var aEntrySpy, aExitSpy, dEntrySpy, dExitSpy, fEntrySpy, fExitSpy, eEntrySpy, eExitSpy;

    beforeEach(function () {
        aEntrySpy = sinon.spy();
        aExitSpy = sinon.spy();
        dEntrySpy = sinon.spy();
        dExitSpy = sinon.spy();
        fEntrySpy = sinon.spy();
        fExitSpy = sinon.spy();
        eEntrySpy = sinon.spy();
        eExitSpy = sinon.spy();

        params = {
            initialState: "A",
            states: {
                A: {
                    entry: aEntrySpy,
                    exit: aExitSpy,
                    goA: { target: "A" },
                    goB: { target: "B" },
                    goC: { target: "C" },
                    goD: { target: "D" },
                    goE: { target: "E" },
                    states: {
                        childrenOfA: {
                            init: "D",
                            states: {
                                D: {
                                    entry: dEntrySpy,
                                    exit: dExitSpy,
                                    goE2: { target: "E" },
                                    goF: { target: "F" },
                                    states: {
                                        childrenOfD: {
                                            init: 'F',
                                            states: {
                                                F: {
                                                    entry: fEntrySpy,
                                                    exit: fExitSpy,
                                                    goE3: { target: "E" }
                                                }
                                            }
                                        }
                                    }
                                },
                                E: {
                                    entry: eEntrySpy,
                                    exit: eExitSpy,
                                    goD2: { target: "D" }
                                }
                            }
                        }
                    }
                },
                C: {
                    goA: { target: "A" },
                }
            }
        };

        fsm = _.extend(params, Statechart);
        fsm.run();
    });

    describe("moving to a nested state from its parent", function () {
        beforeEach(function () {
            fsm.dispatch("goD");
        });

        it("moves to the right state", function () {
            expect(fsm.currentState().name).to.equal("D");
        });

        it("does not fire the grandparent state's exit event", function () {
            expect(aExitSpy.called).not.to.equal(true);
        });

        it("fires the the entered state's entry event", function () {
            expect(dEntrySpy.called).to.equal(true);
        });
    });

    describe("moving to a nested state from its nested sibling", function () {
        beforeEach(function () {
            fsm.dispatch("goD");
            fsm.dispatch("goE2");
        });

        it("moves to the right state", function () {
            expect(fsm.currentState().name).to.equal("E");
        });

        it("does not fire the grandparent state's exit event", function () {
            expect(aExitSpy.called).not.to.equal(true);
        });

        it("fires the first nested state's entry event", function () {
            expect(dEntrySpy.called).to.equal(true);
        });

        it("fires the first nested state's exit event", function () {
            expect(dExitSpy.called).to.equal(true);
        });

        xit("fires the second nested state's entry event", function () {
            expect(eEntrySpy.called).to.equal(true);
        });
    });

    describe("moving to a nested state from its nested sibling's child", function () {
        beforeEach(function () {
            fsm.dispatch("goD");
            fsm.dispatch("goF");
            fsm.dispatch("goE3");
        });

        it("moves to the right state", function () {
            expect(fsm.currentState().name).to.equal("E");
        });

        it("does not fire the grandparent state's exit event", function () {
            expect(aExitSpy.called).not.to.equal(true);
        });

        it("fires the first nested state's entry event", function () {
            expect(dEntrySpy.called).to.equal(true);
        });

        it("fires the first nested state's child's entry event", function () {
            expect(fEntrySpy.called).to.equal(true);
        });

        it("fires the first nested state's child's exit event", function () {
            expect(fExitSpy.called).to.equal(true);
        });

        it("fires the first nested state's exit event", function () {
            expect(dExitSpy.called).to.equal(true);
        });

        xit("fires the second nested state's entry event", function () {
            expect(eEntrySpy.called).to.equal(true);
        });
    });
});

describe("the reserved event", function () {
    var fsm;
    var params = {
        initialState: "A",
        states: {
        }
    };

    describe("`init`", function () {
        describe("when defined as the string name of a state", function () {
            beforeEach(function () {
                params.states.A = {
                    init: 'B',
                    states: {
                        B: {}
                    }
                };
                fsm = _.extend(params, Statechart);
                fsm.run();
            });

            it("transitions to that state", function () {
                expect(fsm.currentState().name).to.equal('B');
            });
        });

        describe("when defined as a proper event object", function () {
            var error, err;

            beforeEach(function () {
                params.states.A = {
                    init: {
                        target: 'B'
                    },
                    states: {
                        B: {}
                    }
                };
                fsm = _.extend(params, Statechart);
                try {
                    fsm.run();
                } catch (err) {
                    error = err;
                }
            });

            it("throws an error", function () {
                expect(error).not.to.equal(undefined);
            });

            it("does not transition away from the previous state", function () {
                expect(fsm.currentState().name).to.equal('A');
            });
        });

        describe("when defined as an array of events", function () {
            var error, err;
            var aExitSpy;

            beforeEach(function () {
                aExitSpy = sinon.spy();

                params.states.A = {
                    exit: aExitSpy,
                    init: [{
                        target: 'B',
                        guard: function () { return true; }
                    }, {
                        target: 'C',
                        guard: function () { return false; }
                    }],
                    states: {
                        B: {},
                        C: {}
                    }
                };
                fsm = _.extend(params, Statechart);
                try {
                    fsm.run();
                } catch (err) {
                    error = err;
                }
            });

            it("throws an error", function () {
                expect(error).not.to.equal(undefined);
            });

            it("does not transition away from the previous state", function () {
                expect(fsm.currentState().name).to.equal('A');
            });

            xit("does not call the previous state's exit event", function () {
                expect(aExitSpy.called).to.equal(false);
            });
        });

        describe("when defined as a function", function () {
            var error, err;
            var aExitSpy;

            beforeEach(function () {
                aExitSpy = sinon.spy();

                params.states.A = {
                    exit: aExitSpy,
                    init: function () {
                        // some action
                        return "B";
                    },
                    states: {
                        B: {}
                    }
                };
                fsm = _.extend(params, Statechart);
                try {
                    fsm.run();
                } catch (err) {
                    error = err;
                }
            });

            it("throws an error", function () {
                expect(error).not.to.equal(undefined);
            });

            it("does not transition away from the previous state", function () {
                expect(fsm.currentState().name).to.equal('A');
            });

            it("does not call exit event", function () {
                expect(aExitSpy.called).to.equal(false);
            });
        });
    });


    describe("`entry`", function () {
        describe("when defined as the string name of a state", function () {
            var aExitSpy;

            beforeEach(function () {
                aExitSpy = sinon.spy();

                params.states.A = {
                    entry: 'B',
                    exit: aExitSpy,
                    states: {
                        B: {}
                    }
                };
                fsm = _.extend(params, Statechart);
                fsm.run();
            });

            it("does not transition", function () {
                expect(fsm.currentState().name).to.equal('A');
            });

            it("does not call exit event", function () {
                expect(aExitSpy.called).to.equal(false);
            });
        });

        describe("when defined as a proper event object with a target", function () {
            var error, err;

            beforeEach(function () {
                params.states.A = {
                    entry: {
                        target: 'B'
                    },
                    states: {
                        B: {}
                    }
                };
                fsm = _.extend(params, Statechart);
                try {
                    fsm.run();
                } catch (err) {
                    error = err;
                }
            });

            it("throws an error", function () {
                expect(error).not.to.equal(undefined);
            });

            it("does not transition away from the previous state", function () {
                expect(fsm.currentState().name).to.equal('A');
            });
        });

        describe("when defined as a proper event object with no target", function () {
            var error, err;
            var aEntrySpy;

            beforeEach(function () {
                aEntrySpy = sinon.spy();

                params.states.A = {
                    entry: {
                        action: aEntrySpy
                    },
                    states: {
                        B: {}
                    }
                };
                fsm = _.extend(params, Statechart);
                try {
                    fsm.run();
                } catch (err) {
                    error = err;
                }
            });

            it("does not throw an error", function () {
                expect(error).to.equal(undefined);
            });

            it("runs the action", function () {
                expect(aEntrySpy.called).to.equal(true);
            });
        });

        describe("when defined as an array of events without targets", function () {
            var error, err;
            var aEntrySpy;

            beforeEach(function () {
                aEntrySpy = sinon.spy();

                params.states.A = {
                    entry: [{
                        guard: function () { return true; },
                        action: aEntrySpy
                    }, {
                        guard: function () { return false; }
                    }]
                };
                fsm = _.extend(params, Statechart);
                try {
                    fsm.run();
                } catch (err) {
                    error = err;
                }
            });

            it("does not throw an error", function () {
                expect(error).to.equal(undefined);
            });

            it("does not transition away from the previous state", function () {
                expect(fsm.currentState().name).to.equal('A');
            });

            it("runs the action", function () {
                expect(aEntrySpy.called).to.equal(true);
            });
        });

        describe("when defined as a function", function () {
            var error, err;
            var aEntrySpy;

            beforeEach(function () {
                aEntrySpy = sinon.spy();

                params.states.A = {
                    entry: aEntrySpy
                };
                fsm = _.extend(params, Statechart);
                try {
                    fsm.run();
                    fsm.dispatch('goA');
                } catch (err) {
                    error = err;
                }
            });

            it("does not throw an error", function () {
                expect(error).to.equal(undefined);
            });

            it("runs the action", function () {
                expect(aEntrySpy.called).to.equal(true);
            });

            it("does not transition away from the previous state", function () {
                expect(fsm.currentState().name).to.equal('A');
            });
        });
    });

    describe("`exit`", function () {
        describe("when defined as the string name of a state", function () {
            beforeEach(function () {
                params.states.A = {
                    exit: 'B',
                    goC: {
                        target: 'C'
                    },
                    states: {
                        B: {},
                        C: {}
                    }
                };
                fsm = _.extend(params, Statechart);
                fsm.run();
                expect(fsm.currentState().name).to.equal('A');
                fsm.dispatch('goC');
            });

            it("does not transition to that state", function () {
                expect(fsm.currentState().name).not.to.equal('B');
            });
        });

        describe("when defined as a proper event object with a target", function () {
            var error, err;
            var aExitSpy, bEntrySpy;

            beforeEach(function () {
                aExitSpy = sinon.spy();
                bEntrySpy = sinon.spy();

                params.states.A = {
                    goC: {
                        target: 'C'
                    },
                    exit: {
                        target: 'B',
                        action: aExitSpy
                    }
                };
                params.states.B = {
                    entry: {
                        action: bEntrySpy
                    }
                };
                params.states.C = {};

                fsm = _.extend(params, Statechart);
                try {
                    fsm.run();
                    fsm.dispatch('goC');
                } catch (err) {
                    error = err;
                }
            });

            it("throws an error", function () {
                expect(error).not.to.equal(undefined);
            });

            it("does not transition away from the previous state", function () {
                expect(fsm.currentState().name).to.equal('A');
            });

            xit("does not fire the current state's exit event", function () {
                expect(aExitSpy.called).to.equal(false);
            });

            it("does not fire the erroneously configured target state's entry event", function () {
                expect(bEntrySpy.called).to.equal(false);
            });
        });

        describe("when defined as a proper event object with no target", function () {
            var error, err;
            var aExitSpy;

            beforeEach(function () {
                aExitSpy = sinon.spy();

                params.states.A = {
                    goB: {
                        target: 'B'
                    },
                    exit: {
                        action: aExitSpy
                    }
                };
                params.states.B = {};
                fsm = _.extend(params, Statechart);
                try {
                    fsm.run();
                    fsm.dispatch('goB');
                } catch (err) {
                    error = err;
                }
            });

            it("does not throw an error", function () {
                expect(error).to.equal(undefined);
            });

            it("runs the action", function () {
                expect(aExitSpy.called).to.equal(true);
            });
        });

        describe("when defined as an array of events", function () {
            var error, err;
            var aExitSpy1, aExitSpy2;

            beforeEach(function () {
                aExitSpy1 = sinon.spy();
                aExitSpy2 = sinon.spy();

                params.states.A = {
                    goC: {
                        target: 'C'
                    },
                    exit: [{
                        guard: function () { return true; },
                        action: aExitSpy1
                    }, {
                        guard: function () { return false; },
                        action: aExitSpy2
                    }]
                };
                params.states.B = {};
                params.states.C = {};

                fsm = _.extend(params, Statechart);
                try {
                    fsm.run();
                    fsm.dispatch('goC');
                } catch (err) {
                    error = err;
                }
            });

            it("does not throw an error", function () {
                expect(error).to.equal(undefined);
            });

            it("transitions to the given state", function () {
                expect(fsm.currentState().name).to.equal('C');
            });

            it("calls the action of the event whose guard passes", function () {
                expect(aExitSpy1.called).to.equal(true);
            });

            xit("does not call the action of the event whose guard fails", function () {
                expect(aExitSpy2.called).to.equal(false);
            });
        });

        describe("when defined as a function", function () {
            var error, err;
            var aExitSpy;

            beforeEach(function () {
                aExitSpy = sinon.spy();

                params.states.A = {
                    exit: aExitSpy,
                    states: {
                        B: {}
                    }
                };
                fsm = _.extend(params, Statechart);
                try {
                    fsm.run();
                } catch (err) {
                    error = err;
                }
            });

            it("does not throw an error", function () {
                expect(error).to.equal(undefined);
            });

            it("does not transition away from the previous state", function () {
                expect(fsm.currentState().name).to.equal('A');
            });

            it("calls the action", function () {
                expect(aExitSpy.called).to.equal(false);
            });
        });
    });
});

describe("a custom event `move`", function () {
    var fsm;
    var params = {
        initialState: "A",
        states: {
        }
    };

    describe("when defined as the string name of a state", function () {
        beforeEach(function () {
            params.states.A = {
                move: 'B'
            };
            params.states.B = {};
            fsm = _.extend(params, Statechart);
            fsm.run();
            expect(fsm.currentState().name).to.equal('A');
            fsm.dispatch('move');
        });

        it("does not transition to that state", function () {
            expect(fsm.currentState().name).not.to.equal('B');
        });
    });

    describe("when defined as a proper event object with a target", function () {
        var error, err;
        var aMoveSpy, aExitSpy;

        beforeEach(function () {
            aMoveSpy = sinon.spy();
            aExitSpy = sinon.spy();

            params.states.A = {
                exit: aExitSpy,
                move: {
                    target: 'B',
                    action: aMoveSpy
                }
            };
            params.states.B = {};
            fsm = _.extend(params, Statechart);
            try {
                fsm.run();
                fsm.dispatch('move');
            } catch (err) {
                error = err;
            }
        });

        it("does not throw an error", function () {
            expect(error).to.equal(undefined);
        });

        it("transitions away from the previous state", function () {
            expect(fsm.currentState().name).to.equal('B');
        });

        it("runs the action", function () {
            expect(aMoveSpy.called).to.equal(true);
        });

        it("runs the exit action of the previous state", function () {
            expect(aExitSpy.called).to.equal(true);
        });
    });

    describe("when defined as a proper event object with no target", function () {
        var error, err;
        var aMoveSpy;

        beforeEach(function () {
            aMoveSpy = sinon.spy();

            params.states.A = {
                move: {
                    action: aMoveSpy
                }
            };
            fsm = _.extend(params, Statechart);
            try {
                fsm.run();
                fsm.dispatch('move');
            } catch (err) {
                error = err;
            }
        });

        it("does not throw an error", function () {
            expect(error).to.equal(undefined);
        });

        it("does not transition away from the previous state", function () {
            expect(fsm.currentState().name).to.equal('A');
        });

        it("runs the action", function () {
            expect(aMoveSpy.called).to.equal(true);
        });
    });

    describe("when defined as an array of events", function () {
        var error, err;
        var aMoveSpy1;
        var aMoveSpy2;

        beforeEach(function () {
            aMoveSpy1 = sinon.spy();
            aMoveSpy2 = sinon.spy();

            params.states.A = {
                move: [{
                    target: 'B',
                    guard: function () { return true; },
                    action: aMoveSpy1
                }, {
                    target: 'C',
                    guard: function () { return false; },
                    action: aMoveSpy2
                }]
            };
            params.states.B = {};
            params.states.C = {};
            fsm = _.extend(params, Statechart);
            try {
                fsm.run();
                fsm.dispatch('move');
            } catch (err) {
                error = err;
            }
        });

        it("does not throw an error", function () {
            expect(error).to.equal(undefined);
        });

        it("transitions away to the state whose guard passes", function () {
            expect(fsm.currentState().name).to.equal('B');
        });

        it("calls the action of the event whose guard passes", function () {
            expect(aMoveSpy1.called).to.equal(true);
        });

        it("does not call the action of the event whose guard fails", function () {
            expect(aMoveSpy2.called).to.equal(false);
        });
    });

    describe("when defined as a function", function () {
        var error, err;
        var moveSpy = sinon.spy();

        beforeEach(function () {
            params.states.A = {
                move: moveSpy
            };
            fsm = _.extend(params, Statechart);
            try {
               fsm.run();
               fsm.dispatch('move');
            } catch (err) {
                error = err;
            }
        });

        it("does not throw an error", function () {
            expect(error).to.equal(undefined);
        });

        it("does not transition away from the previous state", function () {
            expect(fsm.currentState().name).to.equal('A');
        });

        it("calls the action", function () {
            expect(moveSpy.called).to.equal(true);
        });
    });
});
