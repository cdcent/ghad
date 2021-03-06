const moment = require("moment");
const nock = require("nock");
const octokit = require("../lib/client");
const { getLatestEvent, attrAfter, hasDeprecationText } = require("./archive");

nock.disableNetConnect();
jest.mock("../lib/client");

describe("getLatestEvent()", () => {
  test("filters external events", async () => {
    octokit.activity.listRepoEvents.mockResolvedValue({
      data: [{ type: "ForkEvent" }, { type: "OtherEvent" }]
    });

    const repo = {
      name: "test-repo",
      owner: { login: "test-org" }
    };
    const event = await getLatestEvent(repo);
    expect(event.type).toBe("OtherEvent");
  });
});

describe("attrAfter()", () => {
  test.each([
    [
      "2011-01-26T19:14:43Z",
      moment.utc({ y: 2011, m: 1, d: 26, h: 19, m: 14, s: 44 }),
      false
    ],
    [
      "2011-01-26T19:14:43Z",
      moment.utc({ y: 2011, m: 1, d: 26, h: 19, m: 14, s: 42 }),
      true
    ]
  ])("properly compares '%s' to '%s'", (input, cutoff, expected) => {
    const result = attrAfter(input, cutoff);
    expect(result).toBe(expected);
  });
});

describe("hasDeprecationText()", () => {
  test.each([
    ["DEPRECATED for reasons unknown", true],
    ["not supported", true],
    ["No Longer Supported", true],
    ["other description", false]
  ])(
    "repositories with a description of '%s'",
    (description, shouldArchive) => {
      const result = hasDeprecationText(description);
      expect(result).toBe(shouldArchive);
    }
  );
});
