import db from './db'
import Queue from 'bull'

export const queueOption = {
  redis: {
    host: '127.0.0.1',
    port: 6379,
    password: 'Msxq2VhWbRk2UwhVD3F6QJFPaPSDjwQrbpPuwpmxLbkzJGYVVe9dcetWuJzPg7x5QE77A4uA8gTMwG',
  },
  prefix: 'demo',
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: true,
  },
}
const queue = new Queue('test concurrent queue', queueOption)
export const WORKER_A = 'WORKER_A'
export const WORKER_B = 'WORKER_B'
export const WORKER_C = 'WORKER_C'

const handleNextJob = (worker) => {
  db.findOne({ worker: worker }).sort({ createdAt: 1 }).exec(function (err, doc) {
    // docs is [doc3, doc1]
    if (doc) {
      queue.add(`Auto withdraw`, doc.data, doc.option)
      db.remove({ _id: doc._id })
    }
  })
}
// queue.add('test concurrent queue', { worker: WORKER_A, id: 1 }, { jobId: 1, removeOnComplete: true })
// queue.add('test concurrent queue', { worker: WORKER_A, id: 2 }, { jobId: 2, removeOnComplete: true })
// queue.add('test concurrent queue', { worker: WORKER_A, id: 3 }, { jobId: 3, removeOnComplete: true })
// queue.add('test concurrent queue', { worker: WORKER_B, id: 4 }, { jobId: 4, removeOnComplete: true })
// queue.add('test concurrent queue', { worker: WORKER_B, id: 5 }, { jobId: 5, removeOnComplete: true })
// queue.add('test concurrent queue', { worker: WORKER_B, id: 6 }, { jobId: 6, removeOnComplete: true })
const processWorker = async function (job, done) {
  // const activeQueue = await queue.getActive()
  await new Promise(resolve => setTimeout(() => {
    job.progress(100)
    resolve()
  }, 1000 * 4))
  return done()
}
queue.process(`*`, 5, processWorker)
queue
  .on('error', function (error) {
    console.log('error', error)
    // An error occured.
  })
  .on('waiting', function (jobId) {
    console.log('waiting -> jobId', jobId)
    // A Job is waiting to be processed as soon as a worker is idling.
  })
  .on('active', async function (job) {
    // A job has started. You can use `jobPromise.cancel()`` to abort it.
    console.log('active -> job', job.data)
  })
  .on('failed', function (job, err) {
    console.log('failed -> job', job.data)
    console.log('failed -> err', err.message)
    // A job failed with reason `err`!
  })
  .on('completed', async function (job, result) {
    console.log('completed -> job', job.data)
    handleNextJob(job.data.worker)
    // await queue.close()
  })
//   .on('stalled', function (job) {
//     // A job has been marked as stalled. This is useful for debugging job
//     // workers that crash or pause the event loop.
//   }).on('progress', function (job, progress) {
//   console.log('progress -> job', job.data)
//   // A job's progress was updated!
// }).on('completed', function (job, result) {
//   // A job successfully completed with a `result`.
// }).on('paused', function () {
//   // The queue has been paused.
// }).on('resumed', function (job) {
//   // The queue has been resumed.
// }).on('cleaned', function (jobs, type) {
//   // Old jobs have been cleaned from the queue. `jobs` is an array of cleaned
//   // jobs, and `type` is the type of jobs cleaned.
// }).on('drained', function () {
//   // Emitted every time the queue has processed all the waiting jobs (even if there can be some delayed jobs not yet processed)
// }).on('removed', function (job) {
//   // A job successfully removed.
// })

export default queue
