#include <node.h>
#include "ctp_md.h"
#include "ctp_td.h"

namespace node_ctp {

using namespace v8;

void InitModule(Local<Object> exports) {
  CtpMd::InitNodeClass(exports);
  CtpTd::InitNodeClass(exports);
}

NODE_MODULE(node_ctp, InitModule)

} /* namespace node_ctp */