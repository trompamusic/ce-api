import { generateScope } from './schema'

describe('generateScope', function () {
  it('should generate the scope correctly', () => {
    expect(generateScope('Mutation', 'CreatePerson')).toEqual('Mutation:Person:Create')
    expect(generateScope('Mutation', 'DeletePerson')).toEqual('Mutation:Person:Delete')
    expect(generateScope('Mutation', 'MergePerson')).toEqual('Mutation:Person:Merge')
    expect(generateScope('Mutation', 'AddMusicCompositionComposer')).toEqual('Mutation:MusicCompositionComposer:Add')
    expect(generateScope('Mutation', 'RemoveMusicCompositionComposer')).toEqual('Mutation:MusicCompositionComposer:Remove')
  })
})
