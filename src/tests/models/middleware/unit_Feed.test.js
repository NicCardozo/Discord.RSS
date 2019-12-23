const middleware = require('../../../models/middleware/Feed.js')

describe('Unit::models/middleware/Feed', function () {
  describe('findOneAndUpdate', function () {
    it(`throws if the guild change`, function () {
      const found = { guild: 123 }
      const DocQuery = {
        guild: 456,
        model: {
          findOne: jest.fn(() => found)
        },
        getQuery: jest.fn()
      }
      return expect(middleware.findOneAndUpdate.bind(DocQuery)())
        .rejects.toThrowError(new Error('Guild cannot be changed'))
    })
    it(`doesn't throw an error if id is same`, function () {
      const found = { id: 123 }
      const DocQuery = {
        id: found.id,
        model: {
          findOne: jest.fn(() => found)
        },
        getQuery: jest.fn()
      }
      return expect(middleware.findOneAndUpdate.bind(DocQuery)())
        .resolves.toBeUndefined()
    })
  })
  describe('save', function () {
    it('calls the right Model', async function () {
      const model = jest.fn(() => ({
        findById: () => ({ exec: () => ({ update: jest.fn(() => ({ exec: jest.fn() })) }) })
      }))
      const Doc = {
        model
      }
      await middleware.save.bind(Doc)()
      expect(model).toHaveBeenCalledWith('Guild')
    })
    it('calls the right query', async function () {
      const update = jest.fn(() => ({ exec: jest.fn() }))
      const model = jest.fn(() => ({
        findById: () => ({ exec: () => ({ update }) })
      }))
      const Doc = {
        _id: 123,
        model
      }
      await middleware.save.bind(Doc)()
      expect(update).toHaveBeenCalledWith({
        $push: {
          feeds: Doc._id
        }
      })
    })
  })
})