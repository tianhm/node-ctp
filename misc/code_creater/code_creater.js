const process = require('process')
const iconvlite = require('iconv-lite')
const assert = require('assert')
const fs = require('fs')

/* -----------------------------------------------------------------------------
 * 通用生成器
 * -----------------------------------------------------------------------------
 */

/**
 *  根据ThostFtdcUserApiDataType.h生成C++类型到Node类型映射表
 */
class CxxNodeTypeMap {
  constructor () {
    this.typeMap = new Map()
    this._parse()
  }

  _parse () {
    const lines = iconvlite.decode(fs.readFileSync(
      '../../ctp_api/include/ThostFtdcUserApiDataType.h'), 'gbk').split(
      '\n')
    for (let line of lines) {
      line = line.trim()
      if (/typedef\s+(\S+)\s+(\S+);/.test(line)) {
        let type = RegExp.$1
        let name = RegExp.$2

        if (type === 'char') {
          if (/(\w+)\[\d+\]/.exec(name)) {
            this.typeMap.set(RegExp.$1, 'String')
          } else {
            this.typeMap.set(name, 'Char')
          }
        } else if (type === 'int' || type === 'short') {
          this.typeMap.set(name, 'Int')
        } else if (type === 'double') {
          this.typeMap.set(name, 'Double')
        } else {
          assert.ok(false)
        }
      }
    }
  }

  get (cxxType) {
    return this.typeMap.get(cxxType) || '!!!!!!!!!! Unknown;'
  }
}

/* 全局表 */
const CXX_NODE_TYPE_MAP = new CxxNodeTypeMap()

/**
 *  事件枚举生成器
 */
class EnumGenerator {
  constructor (enumName) {
    this.enums = []
    this.enumName = enumName
  }

  add (methodName) {
    this.enums.push(EnumGenerator.formatEnum(methodName))
  }

  static formatEnum (methodName) {
    let chars = []
    let prevUpper = false
    for (let c of methodName) {
      if (c === c.toUpperCase()) {
        if (prevUpper) {
          chars.push(c.toLowerCase())
        } else {
          prevUpper = true
          chars.push(c)
        }
      } else {
        prevUpper = false
        chars.push(c)
      }
    }
    return 'EV_' + chars.join('').replace(/([A-Z]{1})/g, '_$1').replace(/^_+/,
      '').toUpperCase()
  }

  toString () {
    let enums = []
    enums.push(`enum ${this.enumName} {`)
    for (let [i, e] of this.enums.entries()) {
      enums.push(`  ${e} = ${i},`)
    }
    enums.push('};')
    enums.push('\n\n')

    enums.push('switch (baton->ev) {')
    for (let e of this.enums) {
      enums.push(`  case ${e}: {\n    break;\n  }`)
    }
    enums.push('  default: {\n    break;\n  }\n}')
    return enums.join('\n')
  }
}

function formatCxxComment (commentArray) {
  return commentArray.map((line) => line.replace(/。/g, '. ').replace(/，/g,
    ', ').replace(
    /（/g, '(').replace(/）/g, ')').replace(/：/g, ': ').replace(/“/g, '"').replace(
    /”/g, '"').replace(/\.\s*$/g, '')).join('\n')
}

function formatNodeComment (commentArray) {
  return ('/**\n' + formatCxxComment(commentArray).replace(/\/\//g, ' *') +
    '\n */')
}

/* -----------------------------------------------------------------------------
 * API相关生成器
 * -----------------------------------------------------------------------------
 */

/**
 * v8格式类成员函数声明生成器
 */
class APIDeclareGenerator {
  constructor () {
    this.methods = []
  }

  add (commentArray, methodName) {
    this.methods.push([formatNodeComment(commentArray), this._formatDeclare(
      methodName)])
  }

  _formatDeclare (methodName) {
    return `static void ${methodName}(const FunctionCallbackInfo<Value> &args);`
  }

  toString () {
    return this.methods.map((m) =>
      `${m[0]}\n${m[1]}`
    ).join('\n\n')
  }
}

/**
 * v8格式类成员函数注册语句生成器
 */
class APIProtoGenerator {
  constructor () {
    this.protos = []
  }

  add (methodName) {
    this.protos.push(this._formatProto(methodName))
  }

  _formatProto (methodName) {
    let nodeMethodName = methodName[0].toLowerCase() + methodName.slice(
      1)
    return `NODE_SET_PROTOTYPE_METHOD(tpl, "${nodeMethodName}", ${methodName});`
  }

  toString () {
    return this.protos.join('\n')
  }
}

/**
 * v8格式类成员函数定义生成器
 */
class APIDefineGenerator {
  constructor (className) {
    this.methods = []
    this.asyncCases = []
    this.asyncAfterCases = []
    this.className = className
  }

  add (commentArray, methodName, methodArgs) {
    this.methods.push([formatNodeComment(commentArray), this._formatDefine(
      methodName, methodArgs)])
    this.asyncCases.push(this._formatAsyncCase(methodName, methodArgs))
    this.asyncAfterCases.push(this._formatAsyncAfterCase(methodName,
      methodArgs))
  }

  _formatDefine (methodName, methodArgs) {
    return `void ${this.className}::${methodName}(const FunctionCallbackInfo<Value> &args) {\n` +
      this._formatDefineBody(methodName, methodArgs) + '\n}'
  }

  _formatAsyncCase (methodName, methodArgs) {
    let enumName = EnumGenerator.formatEnum(methodName)
    return `    case ${enumName}: {
      ${this._formatAsyncCaseBody(methodName, methodArgs)}
      break;
    }`
  }

  _formatAsyncCaseBody (methodName, methodArgs) {
    let args = methodArgs.split(/,\s*/)
    if (args.length === 2) {
      let firstType = args[0].split(' ')[0]
      let secondValue = args[1].split(' ')[1]
      if (/CThostFtdc.+/.test(firstType) && /nRequestID/.test(secondValue)) {
        return `${firstType} *data = static_cast<${firstType} *>(baton->data.get());
      baton->ret.n = that->api_->${methodName}(data, baton->request_id);`
      }
    }
    return ''
  }

  _formatAsyncAfterCase (methodName, methodArgs) {
    let enumName = EnumGenerator.formatEnum(methodName)
    return `    case ${enumName}: {
      ${this._formatAsyncAfterCaseBody(methodName, methodArgs)}
      break;
    }`
  }

  _formatAsyncAfterCaseBody (methodName, methodArgs) {
    let args = methodArgs.split(/,\s*/)
    if (args.length === 2) {
      let firstType = args[0].split(' ')[0]
      let secondValue = args[1].split(' ')[1]
      if (/CThostFtdc.+/.test(firstType) && /nRequestID/.test(secondValue)) {
        return `    Local<Value> argv[] = {Null(isolate), Number::New(isolate, baton->ret.n)};
      MakeCallback(isolate, ctx, cb, 2, argv);`
      }
    }
    return ''
  }

  _formatDefineBody (methodName, methodArgs) {
    let args = methodArgs.split(/,\s*/)
    if (args.length === 2) {
      let firstType = args[0].split(' ')[0]
      let secondValue = args[1].split(' ')[1]
      if (/CThostFtdc.+/.test(firstType) && /nRequestID/.test(secondValue)) {
        return this._formatDefineBodyByStruct(methodName, firstType)
      }
    }

    return ''
  }

  _formatDefineBodyByStruct (methodName, structName) {
    let body =
      `  Isolate *isolate = args.GetIsolate();

  if (!args[0]->IsObject() || !args[1]->IsInt32() || !args[2]->IsFunction()) {
    isolate->ThrowException(
        Exception::TypeError(String::NewFromUtf8(isolate, "Wrong arguments")));
    return;
  }

  ${this.className} *that = ObjectWrap::Unwrap<${this.className}>(args.Holder());
  Local<Object> obj = args[0]->ToObject();
  int request_id = args[1]->Int32Value();
  Local<Function> cb = Local<Function>::Cast(args[2]);

  ${structName} *data = new ${structName};
  memset(data, 0x0, sizeof(*data));
  `

    const lines = iconvlite.decode(fs.readFileSync(
      '../../ctp_api/include/ThostFtdcUserApiStruct.h'), 'gbk').split(
      '\n')

    let structStart = false
    let commentCache = []

    for (let line of lines) {
      line = line.trim()
      if (new RegExp(`struct\\s+${structName}`).test(line)) {
        structStart = true
      }

      if (structStart) {
        if (/^};/.test(line)) {
          structStart = false
          break
        } else if (/(\/\/.*)/.exec(line)) {
          commentCache.push(RegExp.$1.replace('///', '/* ') + ' */')
        } else if (/(\S+)\s+(\S+);/.exec(line)) {
          let [memberType, memberName] = [RegExp.$1, RegExp.$2]
          let nodeType = CXX_NODE_TYPE_MAP.get(memberType)
          let comment = commentCache.join('\n')
          body +=
            `\n  ${comment}\n  GetNodeObject${nodeType}(isolate, obj, "${memberName}", data->${memberName});`
          commentCache.length = 0
        }
      }
    }

    let enumName = EnumGenerator.formatEnum(methodName)

    body +=
      `

  RequestBaton *baton = new RequestBaton(cb, that, ${enumName}, shared_ptr<void>(data), request_id);
  uv_queue_work(uv_default_loop(), &baton->work, RequestAsync, RequestAsyncAfter);`
    return body
  }

  toString () {
    let body = this.methods.map((m) =>
      `${m[0]}\n${m[1]}`
    ).join('\n\n')
    body += '\n'.repeat(5)

    body += 'switch (baton->ev) {\n'
    body += this.asyncCases.join('\n')
    body += '\n    default: { break; }'
    body += '\n}'
    body += '\n'.repeat(5)

    body += 'switch (baton->ev) {\n'
    body += this.asyncAfterCases.join('\n')
    body += '\n    default: { break; }'
    body += '\n}'
    return body
  }
}

/**
 * Promise函数生成器
 */
class APIPromiseGenerator {
  constructor () {
    this.methods = []
  }

  add (commentArray, methodName, methodArgs, methodReturn) {
    this.methods.push([formatNodeComment(commentArray), this._formatDefine(
      methodName, methodArgs, methodReturn)])
  }

  _formatDefine (methodName, methodArgs, methodReturn) {
    let nodeMethodName = this._formatNodeName(methodName)
    let nodeMethodArgs = (methodArgs ? methodArgs.split(/,\s*/).map((
        arg) =>
      this._formatNodeArgName(arg)
    ) : []).join(', ')
    let nodeMethodArgsSuper = nodeMethodArgs ? `${nodeMethodArgs}, `
      : ''

    let body =
      `  async ${nodeMethodName} (${nodeMethodArgs}) {`

    if (methodReturn === 'void') {
      body +=
        `
    return new Promise((resolve, reject) => {
      super.${nodeMethodName}(${nodeMethodArgsSuper}(err) => {
        err ? reject(err) : resolve();
      });
    `
    } else {
      body +=
        `
    return new Promise((resolve, reject) => {
      super.${nodeMethodName}(${nodeMethodArgsSuper}(err, data) => {
        err ? reject(err) : resolve(data);
      });
    `
    }
    body += `});
  }`
    return body
  }

  _formatNodeName (name) {
    return name[0].toLowerCase() + name.slice(1)
  }

  _formatNodeArgName (arg) {
    let name = arg.replace(/\s*=.*/, '').split(/\s+/).slice(-1)[0].replace(
      /\*/,
      '').replace(/^psz/, '').replace(/^b/, '').replace(/^pp/, '').replace(
      /^p/, '').replace(
      /^n/, '')
    return name[0].toLowerCase() + name.slice(1)
  }

  toString () {
    return this.methods.map((m) =>
      `${m[0]}\n${m[1]}`
    ).join('\n\n')
  }
}

/* -----------------------------------------------------------------------------
 * SPI相关生成器
 * -----------------------------------------------------------------------------
 */

/**
 * Node层事件字符串->C++层事件枚举生成器
 */
class SPIEventMapGenerator {
  constructor () {
    this.events = []
  }

  add (methodName) {
    this.events.push(this._formatEvent(methodName))
  }

  _formatEvent (methodName) {
    let enumName = EnumGenerator.formatEnum(methodName)
    let nodeName = methodName.replace(/^On/, '')
    return `{"${nodeName}", ${enumName}},`
  }

  toString () {
    return this.events.join('\n')
  }
}

/**
 * SPI类成员函数声明生成器
 */
class SPIDeclareGenerator {
  constructor () {
    this.methods = []
  }

  add (commentArray, methodName, methodArgs) {
    this.methods.push([formatNodeComment(commentArray), this._formatDeclare(
      methodName, methodArgs)])
  }

  _formatDeclare (methodName, methodArgs) {
    return `virtual void ${methodName}(${SPIDeclareGenerator.formatArgs(methodArgs)});`
  }

  static formatArgs (methodArgs) {
    return methodArgs.replace('pRspInfo', 'error').replace(
      'nRequestID', 'request_id').replace('bIsLast', 'last').replace(
      /\*p\w+/, '*data').replace('nTimeLapse', 'time_lapse').replace(
      'nReason', 'reason')
  }

  toString () {
    return this.methods.map((m) =>
      `${m[0]}\n${m[1]}`
    ).join('\n\n')
  }
}

/**
 * SPI类成员函数定义生成器
 */
class SPIDefineGenerator {
  constructor (className) {
    this.methods = []
    this.className = className
    this.asyncAfterCases = []
  }

  add (commentArray, methodName, methodArgs) {
    this.methods.push([formatNodeComment(commentArray), this._formatDefine(
      methodName, methodArgs)])
    this.asyncAfterCases.push(this._formatAsyncAfterCase(methodName,
      methodArgs))
  }

  _formatDefine (methodName, methodArgs) {
    return `void ${this.className}::${methodName}(${SPIDeclareGenerator.formatArgs(methodArgs)}) {\n` +
      this._formatDefineBody(methodName, methodArgs) + '\n}'
  }

  _formatDefineBody (methodName, methodArgs) {
    let args = methodArgs.split(/,\s*/)
    if (args.length > 0) {
      let firstType = args[0].split(' ')[0]
      if (/CThostFtdc.+/.test(firstType)) {
        if (args.length === 4) {
          return this._formatDefineBodyByStruct4(methodName, firstType)
        } else if (args.length === 3) {
          return this._formatDefineBodyByStruct3(methodName, firstType)
        } else if (args.length === 2) {
          return this._formatDefineBodyByStruct2(methodName, firstType)
        } else if (args.length === 1) {
          return this._formatDefineBodyByStruct1(methodName, firstType)
        }
      }
    }

    return ''
  }

  _formatAsyncAfterCase (methodName, methodArgs) {
    let enumName = EnumGenerator.formatEnum(methodName)
    return `    case ${enumName}: {
      ${this._formatAsyncAfterCaseBody(methodName, methodArgs)}
      break;
    }`
  }

  _formatAsyncAfterCaseBody (methodName, methodArgs) {
    let args = methodArgs.split(/,\s*/)
    if (args.length > 0) {
      let firstType = args[0].split(' ')[0]
      if (/CThostFtdc.+/.test(firstType)) {
        if (args.length === 4) {
          return this._formatAsyncAfterCaseByStruct4(methodName, firstType)
        } else if (args.length === 3) {
          return this._formatAsyncAfterCaseByStruct3(methodName, firstType)
        } else if (args.length === 2) {
          return this._formatAsyncAfterCaseByStruct2(methodName, firstType)
        } else if (args.length === 1) {
          return this._formatAsyncAfterCaseByStruct1(methodName, firstType)
        }
      }
    }

    return ''
  }

  /**
   * OnRsp回调函数：(data, error, request_id, last)
   */
  _formatDefineBodyByStruct4 (methodName, structName) {
    let enumName = EnumGenerator.formatEnum(methodName)

    let body =
      `  ResponseAsyncSend(
  new ResponseBaton(${enumName}, shared_ptr<void>(data ? new ${structName}(*data) : NULL),
      shared_ptr<void>(error ? new CThostFtdcRspInfoField(*error) : NULL), request_id, last));`

    return body
  }

  /**
   * OnRsp回调函数：(data, error, request_id, last)
   */
  _formatAsyncAfterCaseByStruct4 (methodName, structName) {
    let body =
      `
   ${structName} *data =
       static_cast<${structName} *>(baton->data.get());
   CThostFtdcRspInfoField *error =
       static_cast<CThostFtdcRspInfoField *>(baton->error.get());

   Local<Object> obj_data = Object::New(isolate);
   Local<Object> obj_error = Object::New(isolate);

    `
    body += this._formatObjectDefine(structName, 'obj_data', 'data')
    body += '\n\n'
    body += this._formatObjectDefine('CThostFtdcRspInfoField',
      'obj_error',
      'error')
    body +=
      `

  Local<Value> argv[] = {obj_data, obj_error,
                             Number::New(isolate, baton->request_id),
                             Boolean::New(isolate, baton->last)};
  MakeCallback(isolate, ctx, cb, 4, argv);`

    return body
  }

  /**
   * OnRspError回调函数：(error, request_id, last)
   */
  _formatDefineBodyByStruct3 (methodName, structName) {
    let enumName = EnumGenerator.formatEnum(methodName)
    assert.ok(structName === 'CThostFtdcRspInfoField')

    let body =
      `  ResponseAsyncSend(
  new ResponseBaton(${enumName},
      shared_ptr<void>(error ? new CThostFtdcRspInfoField(*error) : NULL), request_id, last));`

    return body
  }

  /**
   * OnRspError回调函数：(error, request_id, last)
   */
  _formatAsyncAfterCaseByStruct3 (methodName, structName) {
    assert.ok(structName === 'CThostFtdcRspInfoField')

    let body =
      `
   CThostFtdcRspInfoField *error =
       static_cast<CThostFtdcRspInfoField *>(baton->error.get());

   Local<Object> obj_error = Object::New(isolate);

    `
    body += this._formatObjectDefine('CThostFtdcRspInfoField',
      'obj_error',
      'error')
    body +=
      `

  Local<Value> argv[] = {obj_error,
                             Number::New(isolate, baton->request_id),
                             Boolean::New(isolate, baton->last)};
  MakeCallback(isolate, ctx, cb, 3, argv);`

    return body
  }

  /**
   * OnErr回调函数：(data, error)
   */
  _formatDefineBodyByStruct2 (methodName, structName) {
    let enumName = EnumGenerator.formatEnum(methodName)

    let body =
      `  ResponseAsyncSend(
  new ResponseBaton(${enumName},
      shared_ptr<void>(data ? new ${structName}(*data) : NULL),
      shared_ptr<void>(error ? new CThostFtdcRspInfoField(*error) : NULL))); `

    return body
  }

  /**
   * OnErr回调函数：(data, error)
   */
  _formatAsyncAfterCaseByStruct2 (methodName, structName) {
    let body =
      `
   ${structName} *data =
       static_cast<${structName} *>(baton->data.get());
   CThostFtdcRspInfoField *error =
       static_cast<CThostFtdcRspInfoField *>(baton->error.get());

   Local<Object> obj_data = Object::New(isolate);
   Local<Object> obj_error = Object::New(isolate);

    `
    body += this._formatObjectDefine(structName, 'obj_data', 'data')
    body += '\n\n'
    body += this._formatObjectDefine('CThostFtdcRspInfoField',
      'obj_error',
      'error')
    body +=
      `

  Local<Value> argv[] = {obj_data, obj_error};
  MakeCallback(isolate, ctx, cb, 2, argv);`

    return body
  }

  /**
   * OnRtn(data)
   */
  _formatDefineBodyByStruct1 (methodName, structName) {
    let enumName = EnumGenerator.formatEnum(methodName)

    let body =
      `  ResponseAsyncSend(
  new ResponseBaton(${enumName},
      shared_ptr<void>(data ? new ${structName}(*data) : NULL)));`

    return body
  }

  /**
   * OnRtn(data)
   */
  _formatAsyncAfterCaseByStruct1 (methodName, structName) {
    let body =
      `
   ${structName} *data =
       static_cast<${structName} *>(baton->data.get());

   Local<Object> obj_data = Object::New(isolate);

    `
    body += this._formatObjectDefine(structName, 'obj_data', 'data')
    body +=
      `

  Local<Value> argv[] = {obj_data};
  MakeCallback(isolate, ctx, cb, 1, argv);`

    return body
  }

  _formatObjectDefine (structName, objName, dataName) {
    let body = `if (${dataName}) {`

    const lines = iconvlite.decode(fs.readFileSync(
      '../../ctp_api/include/ThostFtdcUserApiStruct.h'), 'gbk').split(
      '\n')

    let structStart = false
    let commentCache = []

    for (let line of lines) {
      line = line.trim()
      if (new RegExp(`struct\\s+${structName}`).test(line)) {
        structStart = true
      }

      if (structStart) {
        if (/^};/.test(line)) {
          structStart = false
          break
        } else if (/(\/\/.*)/.exec(line)) {
          commentCache.push(RegExp.$1.replace('///', '/* ') + ' */')
        } else if (/(\S+)\s+(\S+);/.exec(line)) {
          let [memberType, memberName] = [RegExp.$1, RegExp.$2]
          let nodeType = CXX_NODE_TYPE_MAP.get(memberType)
          let comment = commentCache.join('\n')

          body += `\n  ${comment}`

          if (nodeType === 'String') {
            body +=
              `\n  ${objName}->Set(String::NewFromUtf8(isolate, "${memberName}"), String::NewFromOneByte(isolate, reinterpret_cast<uint8_t *>(${dataName}->${memberName}), NewStringType::kNormal).ToLocalChecked());`
          } else if (nodeType === 'Char') {
            body +=
              `\n  ${objName}->Set(String::NewFromUtf8(isolate, "${memberName}"), String::NewFromUtf8(isolate, string(1, ${dataName}->${memberName}).c_str()));`
          } else if (nodeType === 'Int' ||
            nodeType === 'Double') {
            body +=
              `\n  ${objName}->Set(String::NewFromUtf8(isolate, "${memberName}"), Number::New(isolate, ${dataName}->${memberName}));`
          } else {
            console.log(nodeType)
            assert.ok(false)
          }

          commentCache.length = 0
        }
      }
    }
    body += '\n}'
    return body
  }

  toString () {
    let body = this.methods.map((m) =>
      `${m[0]}\n${m[1]}`
    ).join('\n\n')
    body += '\n'.repeat(5)

    body += 'switch (baton->ev) {\n'
    body += this.asyncAfterCases.join('\n')
    body += '\n    default: { break; }'
    body += '\n}'

    return body
  }
}

/**
 * Node层SPI类成员函数注册生成器
 */
class SPINodeCallbackRegisterGenerator {
  constructor () {
    this.methods = []
  }

  add (methodName, methodArgs) {
    this.methods.push(this._formatDefine(methodName, methodArgs))
  }

  _formatDefine (methodName, methodArgs) {
    let nodeMethodName = methodName[0].toLowerCase() + methodName.slice(
      1)
    let nodeEvent = methodName.replace(/^On/, '')
    let nodeArgs = this._formatArgs(methodArgs)

    return `super.on('${nodeEvent}', (${nodeArgs}) => { ${this._formatIconv(nodeEvent, nodeArgs)} this.${nodeMethodName}(${nodeArgs}); });`
  }

  _formatArgs (methodArgs) {
    let args = methodArgs.split(/,\s+/).map((arg) => arg.split(/\s+/).slice(-1))
      .join(', ').replace('*pRspInfo', 'error').replace(
        'nRequestID', 'requestId').replace('bIsLast', 'isLast').replace(
        /\*p\w+/, 'data').replace('nTimeLapse', 'timeLapse').replace(
        'nReason', 'reason')

    return args
  }

  _formatIconv (nodeEvent, nodeArgs) {
    let body = ''
    if (/error/.test(nodeArgs)) {
      body +=
        'if (error.ErrorMsg) error.ErrorMsg = iconv.decode(error.ErrorMsg, \'gbk\');'
    }

    if (nodeEvent === 'RspQryInstrument') {
      body +=
        'data.InstrumentName = iconv.decode(data.InstrumentName, \'gbk\');'
    }

    return body
  }

  toString () {
    return this.methods.join('\n')
  }
}

/**
 * Node层SPI类成员函数定义生成器
 */
class SPINodeCallbackGenerator {
  constructor () {
    this.methods = []
  }

  add (commentArray, methodName, methodArgs) {
    this.methods.push([formatNodeComment(commentArray), this._formatDefine(
      methodName, methodArgs)])
  }

  _formatDefine (methodName, methodArgs) {
    let nodeMethodName = methodName[0].toLowerCase() + methodName.slice(
      1)
    return `  ${nodeMethodName}(${this._formatArgs(methodArgs)}) {
    this._emitLog('${methodName}', ${this._formatArgs(methodArgs)});
  }`
  }

  _formatArgs (methodArgs) {
    let args = methodArgs.split(/,\s+/).map((arg) => arg.split(/\s+/).slice(-1))
      .join(', ').replace('*pRspInfo', 'error').replace(
        'nRequestID', 'requestId').replace('bIsLast', 'isLast').replace(
        /\*p\w+/, 'data').replace('nTimeLapse', 'timeLapse').replace(
        'nReason', 'reason')

    return args
  }

  toString () {
    return this.methods.map((m) =>
      `${m[0]}\n${m[1]}`
    ).join('\n\n')
  }
}

/* -----------------------------------------------------------------------------
 * 主处理函数
 * -----------------------------------------------------------------------------
 */

function generateApi (headerPath, addonClassName, apiClassName) {
  const lines = iconvlite.decode(fs.readFileSync(headerPath), 'gbk').split(
    '\n')

  let classStart = false
  let commentCache = []
  let enumGenerator = new EnumGenerator('RequestEvent')
  let declareGenerator = new APIDeclareGenerator()
  let protoGenerator = new APIProtoGenerator()
  let defineGenerator = new APIDefineGenerator(addonClassName)
  let promiseGenerator = new APIPromiseGenerator()

  for (let line of lines) {
    line = line.trim()

    if (new RegExp(`class\\s+\\S+\\s+${apiClassName}`).test(line)) {
      classStart = true
    }

    if (classStart) {
      if (/^};/.test(line)) {
        classStart = false
        break
      } else if (/(\/\/.*)/.exec(line)) {
        commentCache.push(RegExp.$1.replace('///', '// '))
      } else if (/\S+\s+(.+)\((.*)\).*;/.exec(line)) {
        let [methodReturn, methodName, methodArgs] = [
          RegExp.$1.split(' ').slice(0, -1).join(' ').replace('const ', '').trim(),
          RegExp.$1.split(' ').slice(-1)[0].replace('*', ''),
          RegExp.$2
        ]

        enumGenerator.add(methodName)
        declareGenerator.add(commentCache, methodName)
        protoGenerator.add(methodName)
        defineGenerator.add(commentCache, methodName, methodArgs)
        promiseGenerator.add(commentCache, methodName, methodArgs,
          methodReturn)

        commentCache.length = 0
      }
    }
  }

  const exitMethodName = 'Exit'
  const exitMethodComment = ['// 安全退出']

  enumGenerator.add(exitMethodName)
  declareGenerator.add(exitMethodComment, exitMethodName)
  protoGenerator.add(exitMethodName)
  defineGenerator.add(exitMethodComment, exitMethodName, '')

  console.log([enumGenerator, declareGenerator, protoGenerator,
    defineGenerator, promiseGenerator
  ].map((g) => g.toString()).join('\n'.repeat(5)))
}

function generateSpi (headerPath, addonClassName, spiClassName) {
  const lines = iconvlite.decode(fs.readFileSync(headerPath), 'gbk').split(
    '\n')

  let classStart = false
  let commentCache = []
  let enumGenerator = new EnumGenerator('ResponseEvent')
  let eventGenerator = new SPIEventMapGenerator()
  let declareGenerator = new SPIDeclareGenerator()
  let defineGenerator = new SPIDefineGenerator(addonClassName)
  let callbackGenerator = new SPINodeCallbackGenerator()
  let callbackRegisterGenerator = new SPINodeCallbackRegisterGenerator()

  for (let line of lines) {
    line = line.trim()

    if (new RegExp(`class\\s+${spiClassName}`).test(line)) {
      classStart = true
    }

    if (classStart) {
      if (/^};/.test(line)) {
        classStart = false
        break
      } else if (/(\/\/.*)/.exec(line)) {
        commentCache.push(RegExp.$1.replace('///', '// '))
      } else if (/virtual\s+void\s+(\S+)\((.*)\)\s*{};/.exec(line)) {
        let [methodName, methodArgs] = [RegExp.$1, RegExp.$2]

        enumGenerator.add(methodName)
        eventGenerator.add(methodName)
        declareGenerator.add(commentCache, methodName, methodArgs)
        defineGenerator.add(commentCache, methodName, methodArgs)
        callbackGenerator.add(commentCache, methodName, methodArgs)
        callbackRegisterGenerator.add(methodName, methodArgs)

        commentCache.length = 0
      }
    }
  }

  console.log([enumGenerator, eventGenerator, declareGenerator,
    defineGenerator, callbackGenerator, callbackRegisterGenerator
  ].map((g) => g.toString()).join('\n'.repeat(5)))
}

function generateMdApi () {
  generateApi('../../ctp_api/include/ThostFtdcMdApi.h', 'CtpMd',
    'CThostFtdcMdApi')
}

function generateTdApi () {
  generateApi('../../ctp_api/include/ThostFtdcTraderApi.h', 'CtpTd',
    'CThostFtdcTraderApi')
}

function generateMdSpi () {
  generateSpi('../../ctp_api/include/ThostFtdcMdApi.h', 'CtpMd',
    'CThostFtdcMdSpi')
}

function generateTdSpi () {
  generateSpi('../../ctp_api/include/ThostFtdcTraderApi.h', 'CtpTd',
    'CThostFtdcTraderSpi')
}

function generateDataType () {
  const lines = iconvlite.decode(fs.readFileSync(
    '../../ctp_api/include/ThostFtdcUserApiDataType.h'), 'gbk').split(
    '\n')

  let commentCache = []
  let commentBlockStart = false
  let defineMap = []

  for (let line of lines) {
    line = line.trim()

    if (!line.length) {
      continue
    } else if (/\/\/\/(.*)/.exec(line)) {
      let comment = RegExp.$1
      if (/^\/+$/.test(comment)) {
        if (commentBlockStart) {
          commentCache.push(` * ${'-'.repeat(75)}`)
          commentCache.push(' */\n')
          commentBlockStart = false
        } else {
          commentCache.push(`/* ${'-'.repeat(75)}`)
          commentBlockStart = true
        }
      } else {
        if (commentBlockStart) {
          commentCache.push(` * ${RegExp.$1}`)
        } else {
          commentCache.push(`/** ${RegExp.$1} */`)
        }
      }
    } else if (/^typedef.*/.test(line)) {
      commentCache.length = 0
    } else if (/^#define\s+(\S+)\s+(\S+).*/.exec(line)) {
      defineMap.push(
        `${commentCache.join('\n')}\n${RegExp.$1}: ${RegExp.$2},`)
      commentCache.length = 0
    }
  }

  console.log(
    `/* 此文件中定义使用misc/code_generator生成, 不要手动修改 */

module.exports = Object.freeze({


/* ---------------------------------------------------------------------------
 * 数据流重传方式
 * ---------------------------------------------------------------------------
 */

/* 从本交易日开始重传 */
THOST_TERT_RESTART: 0,

/* 从上次收到的续传 */
THOST_TERT_RESUME: 1,

/* 只传送登录后的数据 */
THOST_TERT_QUICK: 2,
  `
  )

  console.log(defineMap.join('\n\n'))
  console.log(`
});
  `)
}

if (require.main === module) {
  let usage = () => {
    console.log(
      `usage: node ${argv[0]} md-api | md-spi | td-api | td-spi | data-type)`
    )
    process.exit()
  }

  const argv = process.argv.splice(1)
  if (argv.length !== 2) {
    usage()
  }

  switch (argv[1]) {
    case 'md-api':
      generateMdApi()
      break
    case 'md-spi':
      generateMdSpi()
      break
    case 'td-api':
      generateTdApi()
      break
    case 'td-spi':
      generateTdSpi()
      break
    case 'data-type':
      generateDataType()
      break
    default:
      usage()
      break
  }
}
