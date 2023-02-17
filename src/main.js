const { defineAbility, createMongoAbility } = require("@casl/ability");
const { interpolation } = require("interpolate-json");
const Mustache = require("mustache");

class Entity {
  constructor(attributes) {
    Object.assign(this, attributes);
  }
}

class User extends Entity {}

class Article extends Entity {}

const abilityWithConditions = () => {
  const defineAbilityFor = (user) => {
    return defineAbility((can) => {
      // A user can read any article
      can("read", "Article");
      if (user.isAuthenticated) {
        // A user can only update their articles
        can("update", "Article", { authorId: user.id });
        // A user can create comments
        can("create", "Comment");
        // A user can update only their comments
        can("update", "Comment", { authorId: user.id });
      }
    });
  };

  const user = new User({ id: 1, isAuthenticated: true });
  const ownArticle = new Article({ authorId: 1 });
  const anotherArticle = new Article({ authorId: 2 });
  const ability = defineAbilityFor(user);
  console.log({
    "read:ownArticle": ability.can("read", ownArticle),
    "update:ownArticle": ability.can("update", ownArticle),
    "update:AnotherArticle": ability.can("update", anotherArticle),
  });
};

const abilityWithFields = () => {
  const defineAbilityFor = (user) => {
    return defineAbility((can) => {
      // A user can read any article
      can("read", "Article");
      // A user can update only the title and description properties of their own articles
      can("update", "Article", ["title", "description"], { authorId: user.id });
      if (user.isModerator) {
        // A moderator user can update only the published property of any article
        can("update", "Article", ["published"]);
      }
    });
  };

  const moderator = new User({ id: 1, isModerator: true });
  const ownArticle = new Article({ authorId: 1 });
  const foreignArticle = new Article({ authorId: 2 });
  const ability = defineAbilityFor(moderator);

  console.log({
    "read:ownArticle": ability.can("read", ownArticle),
    "read:foreignArticle": ability.can("read", foreignArticle),
    "update:ownArticle.published": ability.can(
      "update",
      ownArticle,
      "published"
    ),
    "update:foreignArticle.published": ability.can(
      "update",
      foreignArticle,
      "published"
    ),
    "update:foreignArticle.title": ability.can(
      "update",
      foreignArticle,
      "title"
    ),
  });
};

// abilityWithConditions();
// abilityWithFields();
