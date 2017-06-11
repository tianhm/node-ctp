#ifndef QUEUE_H
#define QUEUE_H

#include <condition_variable>
#include <mutex>
#include <queue>

namespace node_ctp {

using std::mutex;
using std::unique_lock;
using std::condition_variable;
using std::queue;

template <typename T>
class ConcurrentQueue {
 public:
  T Pop() {
    unique_lock<mutex> lock(mutex_);
    while (queue_.empty()) {
      cond_.wait(lock);
    }
    auto item = queue_.front();
    queue_.pop();

    return item;
  }

  void Pop(T& item) {
    unique_lock<mutex> lock(mutex_);

    while (queue_.empty()) {
      cond_.wait(lock);
    }
    item = queue_.front();
    queue_.pop();
  }

  bool TryPop(T& item) {
    unique_lock<mutex> lock(mutex_);

    if (queue_.empty()) {
      return false;
    }

    item = queue_.front();
    queue_.pop();
    return true;
  }

  void Push(const T& item) {
    unique_lock<mutex> lock(mutex_);
    queue_.push(item);
    lock.unlock();
    cond_.notify_one();
  }

  void Push(T&& item) {
    unique_lock<mutex> lock(mutex_);
    queue_.push(move(item));
    lock.unlock();
    cond_.notify_one();
  }

  bool Empty() {
    unique_lock<mutex> lock(mutex_);
    return queue_.empty();
  }

 private:
  queue<T> queue_;
  mutex mutex_;
  condition_variable cond_;
};

} /* node_ctp */

#endif /* QUEUE_H */