import { generateScope, parseFieldName } from './schema'

describe('parseFieldName', function () {
  it('should parse the field name into action and type', () => {
    expect(parseFieldName('CreatePerson')).toMatchObject({ action: 'Create', type: 'Person' })
    expect(parseFieldName('DeletePerson')).toMatchObject({ action: 'Delete', type: 'Person' })
    expect(parseFieldName('MergePerson')).toMatchObject({ action: 'Merge', type: 'Person' })
    expect(parseFieldName('AddMusicCompositionComposer')).toMatchObject({ action: 'Add', type: 'MusicCompositionComposer' })
    expect(parseFieldName('RemoveMusicCompositionComposer')).toMatchObject({ action: 'Remove', type: 'MusicCompositionComposer' })
  })
})

describe('generateScope', function () {
  it('should generate the scope correctly', () => {
    expect(generateScope('Mutation', 'CreatePerson')).toEqual('Mutation:Person:Create')
    expect(generateScope('Mutation', 'DeletePerson')).toEqual('Mutation:Person:Delete')
    expect(generateScope('Mutation', 'MergePerson')).toEqual('Mutation:Person:Merge')
    expect(generateScope('Mutation', 'AddMusicCompositionComposer')).toEqual('Mutation:MusicCompositionComposer:Add')
    expect(generateScope('Mutation', 'RemoveMusicCompositionComposer')).toEqual('Mutation:MusicCompositionComposer:Remove')
  })
})
