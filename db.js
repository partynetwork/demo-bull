import Datastore from 'nedb'

const db = new Datastore({ filename: 'await-queue.db', autoload: true })
export default db
