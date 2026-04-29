<template>
  <div class="data-report">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ getReportTitle() }}</span>
          <el-button v-if="hasDraft" type="warning" @click="loadDraft">加载草稿</el-button>
        </div>
      </template>

      <el-steps :active="currentStep" finish-status="success" align-center>
        <el-step title="基础信息" />
        <el-step title="质检信息" />
        <el-step :title="getStepTitle(2)" />
        <el-step title="附件上传" />
        <el-step title="区块链存证" />
      </el-steps>

      <div class="form-container">
        <!-- 上游企业表单 -->
        <template v-if="enterpriseType === 'upstream'">
          <!-- 步骤1: 基础信息 -->
          <el-form
            v-show="currentStep === 0"
            ref="baseFormRef"
            :model="upstreamForm.base"
            :rules="upstreamRules.base"
            label-width="120px"
          >
            <el-form-item label="原料名称" prop="materialName">
              <el-input v-model="upstreamForm.base.materialName" placeholder="请输入原料名称" />
            </el-form-item>
            <el-form-item label="规格" prop="specification">
              <el-input v-model="upstreamForm.base.specification" placeholder="请输入规格" />
            </el-form-item>
            <el-form-item label="批次号" prop="batchNo">
              <el-input v-model="upstreamForm.base.batchNo" placeholder="系统自动生成或手动录入">
                <template #append>
                  <el-button @click="generateBatchNo">自动生成</el-button>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="生产数量" prop="productionQuantity">
              <el-input-number
                v-model="upstreamForm.base.productionQuantity"
                :min="0"
                :precision="2"
                style="width: 100%"
              />
              <span style="margin-left: 10px; color: #909399;">kg</span>
            </el-form-item>
            <el-form-item label="库存余量" prop="inventoryRemainder">
              <el-input-number
                v-model="upstreamForm.base.inventoryRemainder"
                :min="0"
                :precision="2"
                style="width: 100%"
              />
              <span style="margin-left: 10px; color: #909399;">kg</span>
            </el-form-item>
            <el-form-item label="供货对象" prop="supplyTarget">
              <el-select v-model="upstreamForm.base.supplyTarget" placeholder="请选择合作企业" filterable>
                <el-option
                  v-for="enterprise in partnerEnterprises"
                  :key="enterprise.id"
                  :label="enterprise.name"
                  :value="enterprise.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="生产时间" prop="productionTime">
              <el-date-picker
                v-model="upstreamForm.base.productionTime"
                type="datetime"
                placeholder="选择生产时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="负责人" prop="responsible">
              <el-input v-model="upstreamForm.base.responsible" placeholder="请输入负责人" />
            </el-form-item>
          </el-form>

          <!-- 步骤2: 质检信息 -->
          <el-form
            v-show="currentStep === 1"
            ref="qualityFormRef"
            :model="upstreamForm.quality"
            :rules="upstreamRules.quality"
            label-width="120px"
          >
            <el-form-item label="质检项目" prop="qualityItems">
              <el-input v-model="upstreamForm.quality.qualityItems" placeholder="请输入质检项目" />
            </el-form-item>
            <el-form-item label="质检结果" prop="qualityResult">
              <el-radio-group v-model="upstreamForm.quality.qualityResult">
                <el-radio label="qualified">合格</el-radio>
                <el-radio label="unqualified">不合格</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              v-if="upstreamForm.quality.qualityResult === 'unqualified'"
              label="不合格原因"
              prop="unqualifiedReason"
            >
              <el-input
                v-model="upstreamForm.quality.unqualifiedReason"
                type="textarea"
                :rows="4"
                placeholder="请输入不合格原因"
              />
            </el-form-item>
            <el-form-item label="质检人" prop="qualityInspector">
              <el-input v-model="upstreamForm.quality.qualityInspector" placeholder="请输入质检人" />
            </el-form-item>
            <el-form-item label="质检时间" prop="qualityTime">
              <el-date-picker
                v-model="upstreamForm.quality.qualityTime"
                type="datetime"
                placeholder="选择质检时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-form>

          <!-- 步骤3: 附件 -->
          <div v-show="currentStep === 2">
            <el-form label-width="120px">
              <el-form-item label="质检报告">
                <el-upload
                  v-model:file-list="upstreamForm.attachments.qualityReport"
                  action="#"
                  :auto-upload="false"
                  :limit="1"
                  accept=".pdf,.doc,.docx"
                >
                  <el-button type="primary">选择文件</el-button>
                  <template #tip>
                    <div class="el-upload__tip">支持 PDF/Word 格式，大小不超过 10MB</div>
                  </template>
                </el-upload>
              </el-form-item>
              <el-form-item label="生产现场图片">
                <el-upload
                  v-model:file-list="upstreamForm.attachments.productionImages"
                  action="#"
                  :auto-upload="false"
                  :limit="5"
                  list-type="picture-card"
                  accept="image/*"
                >
                  <el-icon><Plus /></el-icon>
                </el-upload>
              </el-form-item>
            </el-form>
          </div>

          <!-- 步骤3: 附件 -->
          <div v-show="currentStep === 2">
            <el-form label-width="120px">
              <el-form-item label="质检报告">
                <el-upload
                  v-model:file-list="upstreamForm.attachments.qualityReport"
                  action="#"
                  :auto-upload="false"
                  :limit="1"
                  accept=".pdf,.doc,.docx"
                >
                  <el-button type="primary">选择文件</el-button>
                  <template #tip>
                    <div class="el-upload__tip">支持 PDF/Word 格式，大小不超过 10MB</div>
                  </template>
                </el-upload>
              </el-form-item>
              <el-form-item label="生产现场图片">
                <el-upload
                  v-model:file-list="upstreamForm.attachments.productionImages"
                  action="#"
                  :auto-upload="false"
                  :limit="5"
                  list-type="picture-card"
                  accept="image/*"
                >
                  <el-icon><Plus /></el-icon>
                </el-upload>
              </el-form-item>
            </el-form>
          </div>

          <!-- 步骤4: 区块链存证 -->
          <el-form
            v-show="currentStep === 3"
            label-width="120px"
          >
            <el-alert
              :title="getBlockchainStatusText(upstreamForm.blockchain)"
              :type="getBlockchainStatusType(upstreamForm.blockchain.status)"
              :closable="false"
              style="margin-bottom: 20px;"
            />
            <el-form-item label="上链状态">
              <el-tag :type="getBlockchainStatusTagType(upstreamForm.blockchain.status)" size="large">
                {{ getBlockchainStatusName(upstreamForm.blockchain.status) }}
              </el-tag>
            </el-form-item>
            <el-form-item label="区块链哈希" v-if="upstreamForm.blockchain.hash">
              <el-input
                v-model="upstreamForm.blockchain.hash"
                readonly
                style="width: 100%;"
              >
                <template #append>
                  <el-button @click="copyHash(upstreamForm.blockchain.hash)">复制</el-button>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="上链时间" v-if="upstreamForm.blockchain.onChainTime">
              {{ upstreamForm.blockchain.onChainTime }}
            </el-form-item>
            <el-form-item label="区块高度" v-if="upstreamForm.blockchain.blockHeight">
              {{ upstreamForm.blockchain.blockHeight }}
            </el-form-item>
            <el-form-item v-if="upstreamForm.blockchain.status === 'not_on_chain'">
              <el-button type="primary" @click="handleOnChain('upstream')">
                立即上链
              </el-button>
            </el-form-item>
          </el-form>

        </template>

        <!-- 中游企业表单 -->
        <template v-else-if="enterpriseType === 'midstream'">
          <!-- 步骤1: 原料接收 -->
          <el-form
            v-show="currentStep === 0"
            ref="receiveFormRef"
            :model="midstreamForm.receive"
            :rules="midstreamRules.receive"
            label-width="120px"
          >
            <el-form-item label="原料名称" prop="materialName">
              <el-input v-model="midstreamForm.receive.materialName" placeholder="请输入原料名称" />
            </el-form-item>
            <el-form-item label="批次号" prop="batchNo">
              <el-input v-model="midstreamForm.receive.batchNo" placeholder="请输入批次号" />
            </el-form-item>
            <el-form-item label="供应上游企业" prop="supplier">
              <el-select v-model="midstreamForm.receive.supplier" placeholder="请选择上游企业" filterable>
                <el-option
                  v-for="enterprise in partnerEnterprises"
                  :key="enterprise.id"
                  :label="enterprise.name"
                  :value="enterprise.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="接收数量" prop="receiveQuantity">
              <el-input-number
                v-model="midstreamForm.receive.receiveQuantity"
                :min="0"
                :precision="2"
                style="width: 100%"
              />
              <span style="margin-left: 10px; color: #909399;">kg</span>
            </el-form-item>
            <el-form-item label="原料质检状态" prop="qualityStatus">
              <el-radio-group v-model="midstreamForm.receive.qualityStatus">
                <el-radio label="qualified">合格</el-radio>
                <el-radio label="unqualified">不合格</el-radio>
                <el-radio label="pending">待检</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>

          <!-- 步骤2: 生产信息 -->
          <el-form
            v-show="currentStep === 1"
            ref="productionFormRef"
            :model="midstreamForm.production"
            :rules="midstreamRules.production"
            label-width="120px"
          >
            <el-form-item label="成品名称" prop="productName">
              <el-input v-model="midstreamForm.production.productName" placeholder="请输入成品名称" />
            </el-form-item>
            <el-form-item label="规格" prop="specification">
              <el-input v-model="midstreamForm.production.specification" placeholder="请输入规格" />
            </el-form-item>
            <el-form-item label="成品批次号" prop="productBatchNo">
              <el-input v-model="midstreamForm.production.productBatchNo" placeholder="系统自动生成或手动录入">
                <template #append>
                  <el-button @click="generateBatchNo">自动生成</el-button>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="生产数量" prop="productionQuantity">
              <el-input-number
                v-model="midstreamForm.production.productionQuantity"
                :min="0"
                :precision="2"
                style="width: 100%"
              />
              <span style="margin-left: 10px; color: #909399;">kg</span>
            </el-form-item>
            <el-form-item label="生产工序" prop="productionProcess">
              <el-input
                v-model="midstreamForm.production.productionProcess"
                type="textarea"
                :rows="3"
                placeholder="请输入生产工序"
              />
            </el-form-item>
            <el-form-item label="生产时间" prop="productionTime">
              <el-date-picker
                v-model="midstreamForm.production.productionTime"
                type="datetime"
                placeholder="选择生产时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="负责人" prop="responsible">
              <el-input v-model="midstreamForm.production.responsible" placeholder="请输入负责人" />
            </el-form-item>
            <el-form-item label="计划完成时间" prop="planCompleteTime">
              <el-date-picker
                v-model="midstreamForm.production.planCompleteTime"
                type="datetime"
                placeholder="选择计划完成时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-form>

          <!-- 步骤3: 成品质检 -->
          <el-form
            v-show="currentStep === 2"
            ref="qualityFormRef"
            :model="midstreamForm.quality"
            :rules="midstreamRules.quality"
            label-width="120px"
          >
            <el-form-item label="质检项目" prop="qualityItems">
              <el-input v-model="midstreamForm.quality.qualityItems" placeholder="请输入质检项目" />
            </el-form-item>
            <el-form-item label="质检结果" prop="qualityResult">
              <el-radio-group v-model="midstreamForm.quality.qualityResult">
                <el-radio label="qualified">合格</el-radio>
                <el-radio label="unqualified">不合格</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              v-if="midstreamForm.quality.qualityResult === 'unqualified'"
              label="不合格原因"
              prop="unqualifiedReason"
            >
              <el-input
                v-model="midstreamForm.quality.unqualifiedReason"
                type="textarea"
                :rows="4"
                placeholder="请输入不合格原因"
              />
            </el-form-item>
            <el-form-item label="质检人" prop="qualityInspector">
              <el-input v-model="midstreamForm.quality.qualityInspector" placeholder="请输入质检人" />
            </el-form-item>
            <el-form-item label="质检时间" prop="qualityTime">
              <el-date-picker
                v-model="midstreamForm.quality.qualityTime"
                type="datetime"
                placeholder="选择质检时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
            <!-- 包装材料碳排放 -->
            <el-divider content-position="left">包装材料碳排放</el-divider>
            <el-form-item label="包装材料类型" prop="packagingType">
              <el-select v-model="midstreamForm.quality.packagingType" placeholder="请选择包装材料">
                <el-option label="纸箱" value="cardboard" />
                <el-option label="塑料袋" value="plastic_bag" />
                <el-option label="玻璃瓶" value="glass" />
                <el-option label="金属罐" value="metal" />
              </el-select>
            </el-form-item>
            <el-form-item label="包装重量" prop="packagingWeight">
              <el-input-number
                v-model="midstreamForm.quality.packagingWeight"
                :min="0"
                :precision="2"
                style="width: 100%"
              />
              <span style="margin-left: 10px; color: #909399;">kg</span>
            </el-form-item>
          </el-form>

          <!-- 步骤4: 附件 -->
          <div v-show="currentStep === 3">
            <el-form label-width="120px">
              <el-form-item label="加工工序记录">
                <el-upload
                  v-model:file-list="midstreamForm.attachments.processRecord"
                  action="#"
                  :auto-upload="false"
                  :limit="1"
                  accept=".pdf,.doc,.docx"
                >
                  <el-button type="primary">选择文件</el-button>
                </el-upload>
              </el-form-item>
              <el-form-item label="成品质检报告">
                <el-upload
                  v-model:file-list="midstreamForm.attachments.qualityReport"
                  action="#"
                  :auto-upload="false"
                  :limit="1"
                  accept=".pdf,.doc,.docx"
                >
                  <el-button type="primary">选择文件</el-button>
                </el-upload>
              </el-form-item>
              <el-form-item label="生产图片">
                <el-upload
                  v-model:file-list="midstreamForm.attachments.productionImages"
                  action="#"
                  :auto-upload="false"
                  :limit="5"
                  list-type="picture-card"
                  accept="image/*"
                >
                  <el-icon><Plus /></el-icon>
                </el-upload>
              </el-form-item>
            </el-form>
          </div>

          <!-- 步骤5: 区块链存证 -->
          <el-form
            v-show="currentStep === 4"
            label-width="120px"
          >
            <el-alert
              :title="getBlockchainStatusText(midstreamForm.blockchain)"
              :type="getBlockchainStatusType(midstreamForm.blockchain.status)"
              :closable="false"
              style="margin-bottom: 20px;"
            />
            <el-form-item label="上链状态">
              <el-tag :type="getBlockchainStatusTagType(midstreamForm.blockchain.status)" size="large">
                {{ getBlockchainStatusName(midstreamForm.blockchain.status) }}
              </el-tag>
            </el-form-item>
            <el-form-item label="区块链哈希" v-if="midstreamForm.blockchain.hash">
              <el-input
                v-model="midstreamForm.blockchain.hash"
                readonly
                style="width: 100%;"
              >
                <template #append>
                  <el-button @click="copyHash(midstreamForm.blockchain.hash)">复制</el-button>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="上链时间" v-if="midstreamForm.blockchain.onChainTime">
              {{ midstreamForm.blockchain.onChainTime }}
            </el-form-item>
            <el-form-item label="区块高度" v-if="midstreamForm.blockchain.blockHeight">
              {{ midstreamForm.blockchain.blockHeight }}
            </el-form-item>
            <el-form-item v-if="midstreamForm.blockchain.status === 'not_on_chain'">
              <el-button type="primary" @click="handleOnChain('midstream')">
                立即上链
              </el-button>
            </el-form-item>
          </el-form>
        </template>

        <!-- 下游企业表单 -->
        <template v-else-if="enterpriseType === 'downstream'">
          <!-- 步骤1: 成品接收 -->
          <el-form
            v-show="currentStep === 0"
            ref="receiveFormRef"
            :model="downstreamForm.receive"
            :rules="downstreamRules.receive"
            label-width="120px"
          >
            <el-form-item label="成品名称" prop="productName">
              <el-input v-model="downstreamForm.receive.productName" placeholder="请输入成品名称" />
            </el-form-item>
            <el-form-item label="批次号" prop="batchNo">
              <el-input v-model="downstreamForm.receive.batchNo" placeholder="请输入批次号" />
            </el-form-item>
            <el-form-item label="供应中游企业" prop="supplier">
              <el-select v-model="downstreamForm.receive.supplier" placeholder="请选择中游企业" filterable>
                <el-option
                  v-for="enterprise in partnerEnterprises"
                  :key="enterprise.id"
                  :label="enterprise.name"
                  :value="enterprise.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="接收数量" prop="receiveQuantity">
              <el-input-number
                v-model="downstreamForm.receive.receiveQuantity"
                :min="0"
                :precision="2"
                style="width: 100%"
              />
              <span style="margin-left: 10px; color: #909399;">kg</span>
            </el-form-item>
          </el-form>

          <!-- 步骤2: 库存/物流 -->
          <el-form
            v-show="currentStep === 1"
            ref="logisticsFormRef"
            :model="downstreamForm.logistics"
            :rules="downstreamRules.logistics"
            label-width="120px"
          >
            <el-form-item label="库存位置" prop="inventoryLocation">
              <el-input v-model="downstreamForm.logistics.inventoryLocation" placeholder="请输入库存位置" />
            </el-form-item>
            <el-form-item label="计划发货时间" prop="planShipTime">
              <el-date-picker
                v-model="downstreamForm.logistics.planShipTime"
                type="datetime"
                placeholder="选择计划发货时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="物流合作方" prop="logisticsPartner">
              <el-input v-model="downstreamForm.logistics.logisticsPartner" placeholder="请输入物流合作方" />
            </el-form-item>
            <el-form-item label="收货方" prop="receiver">
              <el-input v-model="downstreamForm.logistics.receiver" placeholder="请输入收货方（选填）" />
            </el-form-item>
          </el-form>

          <!-- 步骤3: 溯源关联 -->
          <el-form
            v-show="currentStep === 2"
            ref="traceFormRef"
            :model="downstreamForm.trace"
            :rules="downstreamRules.trace"
            label-width="120px"
          >
            <el-form-item label="绑定批次号" prop="batchNo">
              <el-input v-model="downstreamForm.trace.batchNo" placeholder="与中游批次号一致" />
            </el-form-item>
            <el-form-item label="溯源码生成数量" prop="traceCodeCount">
              <el-input-number
                v-model="downstreamForm.trace.traceCodeCount"
                :min="0"
                style="width: 100%"
              />
              <span style="margin-left: 10px; color: #909399;">个（选填）</span>
            </el-form-item>
          </el-form>

          <!-- 步骤4: 附件 -->
          <div v-show="currentStep === 3">
            <el-form label-width="120px">
              <el-form-item label="成品入库单">
                <el-upload
                  v-model:file-list="downstreamForm.attachments.receipt"
                  action="#"
                  :auto-upload="false"
                  :limit="1"
                  accept="image/*,.pdf"
                >
                  <el-button type="primary">选择文件</el-button>
                </el-upload>
              </el-form-item>
              <el-form-item label="物流单图片">
                <el-upload
                  v-model:file-list="downstreamForm.attachments.logisticsImages"
                  action="#"
                  :auto-upload="false"
                  :limit="5"
                  list-type="picture-card"
                  accept="image/*"
                >
                  <el-icon><Plus /></el-icon>
                </el-upload>
              </el-form-item>
            </el-form>
          </div>

          <!-- 步骤5: 区块链存证 -->
          <el-form
            v-show="currentStep === 4"
            label-width="120px"
          >
            <el-alert
              :title="getBlockchainStatusText(downstreamForm.blockchain)"
              :type="getBlockchainStatusType(downstreamForm.blockchain.status)"
              :closable="false"
              style="margin-bottom: 20px;"
            />
            <el-form-item label="上链状态">
              <el-tag :type="getBlockchainStatusTagType(downstreamForm.blockchain.status)" size="large">
                {{ getBlockchainStatusName(downstreamForm.blockchain.status) }}
              </el-tag>
            </el-form-item>
            <el-form-item label="区块链哈希" v-if="downstreamForm.blockchain.hash">
              <el-input
                v-model="downstreamForm.blockchain.hash"
                readonly
                style="width: 100%;"
              >
                <template #append>
                  <el-button @click="copyHash(downstreamForm.blockchain.hash)">复制</el-button>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="上链时间" v-if="downstreamForm.blockchain.onChainTime">
              {{ downstreamForm.blockchain.onChainTime }}
            </el-form-item>
            <el-form-item label="区块高度" v-if="downstreamForm.blockchain.blockHeight">
              {{ downstreamForm.blockchain.blockHeight }}
            </el-form-item>
            <el-form-item v-if="downstreamForm.blockchain.status === 'not_on_chain'">
              <el-button type="primary" @click="handleOnChain('downstream')">
                立即上链
              </el-button>
            </el-form-item>
          </el-form>
        </template>
      </div>

      <div class="form-actions">
        <el-button v-if="currentStep > 0" @click="prevStep">上一步</el-button>
        <el-button @click="handleSaveDraft">暂存</el-button>
        <el-button @click="handlePreview">预览</el-button>
        <el-button v-if="currentStep < getMaxStep() - 1" type="primary" @click="nextStep">下一步</el-button>
        <el-button v-else type="success" @click="handleSubmit">提交</el-button>
      </div>
    </el-card>

    <!-- 预览弹窗 -->
    <el-dialog v-model="previewVisible" title="数据预览" width="800px">
      <el-descriptions :column="2" border>
        <el-descriptions-item
          v-for="(value, key) in previewData"
          :key="key"
          :label="key"
        >
          {{ value }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getCurrentEnterprise, submitDataReport, saveDraft, getLatestDraft } from '@/utils/api'

const enterpriseType = ref('')
const currentStep = ref(0)
const hasDraft = ref(false)

const partnerEnterprises = ref([
  { id: '1', name: '合作企业A' },
  { id: '2', name: '合作企业B' }
])

// 上游表单
const upstreamForm = ref({
  base: {
    materialName: '',
    specification: '',
    batchNo: '',
    productionQuantity: 0,
    inventoryRemainder: 0,
    supplyTarget: '',
    productionTime: '',
    responsible: ''
  },
  quality: {
    qualityItems: '',
    qualityResult: 'qualified',
    unqualifiedReason: '',
    qualityInspector: '',
    qualityTime: ''
  },
  attachments: {
    qualityReport: [],
    productionImages: []
  },
  blockchain: {
    status: 'not_on_chain', // not_on_chain / processing / success / failed
    hash: '',
    onChainTime: '',
    blockHeight: null
  }
})

const upstreamRules = {
  base: {
    materialName: [{ required: true, message: '请输入原料名称', trigger: 'blur' }],
    batchNo: [{ required: true, message: '请输入批次号', trigger: 'blur' }],
    productionQuantity: [{ required: true, message: '请输入生产数量', trigger: 'blur' }],
    supplyTarget: [{ required: true, message: '请选择供货对象', trigger: 'change' }]
  },
  quality: {
    qualityResult: [{ required: true, message: '请选择质检结果', trigger: 'change' }],
    qualityInspector: [{ required: true, message: '请输入质检人', trigger: 'blur' }]
  }
}

// 中游表单
const midstreamForm = ref({
  receive: {
    materialName: '',
    batchNo: '',
    supplier: '',
    receiveQuantity: 0,
    qualityStatus: 'pending'
  },
  production: {
    productName: '',
    specification: '',
    productBatchNo: '',
    productionQuantity: 0,
    productionProcess: '',
    productionTime: '',
    responsible: '',
    planCompleteTime: '',
    // 碳排放字段（生产能耗）
    powerConsumption: 0,
    fuelConsumption: 0,
    carbonFootprint: null
  },
  quality: {
    qualityItems: '',
    qualityResult: 'qualified',
    unqualifiedReason: '',
    qualityInspector: '',
    qualityTime: ''
  },
  attachments: {
    processRecord: [],
    qualityReport: [],
    productionImages: []
  },
  blockchain: {
    status: 'not_on_chain',
    hash: '',
    onChainTime: '',
    blockHeight: null
  }
})

const midstreamRules = {
  receive: {
    materialName: [{ required: true, message: '请输入原料名称', trigger: 'blur' }],
    batchNo: [{ required: true, message: '请输入批次号', trigger: 'blur' }],
    supplier: [{ required: true, message: '请选择上游企业', trigger: 'change' }],
    receiveQuantity: [{ required: true, message: '请输入接收数量', trigger: 'blur' }]
  },
  production: {
    productName: [{ required: true, message: '请输入成品名称', trigger: 'blur' }],
    productBatchNo: [{ required: true, message: '请输入成品批次号', trigger: 'blur' }],
    productionQuantity: [{ required: true, message: '请输入生产数量', trigger: 'blur' }]
  },
  quality: {
    qualityResult: [{ required: true, message: '请选择质检结果', trigger: 'change' }]
  }
}

// 下游表单
const downstreamForm = ref({
  receive: {
    productName: '',
    batchNo: '',
    supplier: '',
    receiveQuantity: 0
  },
  logistics: {
    inventoryLocation: '',
    planShipTime: '',
    logisticsPartner: '',
    receiver: '',
    // 碳排放字段（物流+包装回收）
    logisticsDistance: 0,
    logisticsMethod: '',
    packagingRecycleRate: 0,
    carbonFootprint: null
  },
  trace: {
    batchNo: '',
    traceCodeCount: 0
  },
  attachments: {
    receipt: [],
    logisticsImages: []
  },
  blockchain: {
    status: 'not_on_chain',
    hash: '',
    onChainTime: '',
    blockHeight: null
  }
})

const downstreamRules = {
  receive: {
    productName: [{ required: true, message: '请输入成品名称', trigger: 'blur' }],
    batchNo: [{ required: true, message: '请输入批次号', trigger: 'blur' }],
    supplier: [{ required: true, message: '请选择中游企业', trigger: 'change' }],
    receiveQuantity: [{ required: true, message: '请输入接收数量', trigger: 'blur' }]
  },
  logistics: {
    inventoryLocation: [{ required: true, message: '请输入库存位置', trigger: 'blur' }]
  }
}

const baseFormRef = ref(null)
const qualityFormRef = ref(null)
const receiveFormRef = ref(null)
const productionFormRef = ref(null)
const logisticsFormRef = ref(null)
const traceFormRef = ref(null)

const previewVisible = ref(false)
const previewData = ref({})

const getReportTitle = () => {
  const map = {
    upstream: '原料数据上报',
    midstream: '成品生产数据上报',
    downstream: '物流数据上报'
  }
  return map[enterpriseType.value] || '数据上报'
}

const getStepTitle = (step) => {
  if (enterpriseType.value === 'midstream') {
    return step === 2 ? '成品质检' : ''
  } else if (enterpriseType.value === 'downstream') {
    return step === 2 ? '溯源关联' : ''
  }
  return ''
}

const getMaxStep = () => {
  // 现在所有企业类型都有5步：基础信息、质检信息、其他步骤、附件上传、区块链存证
  if (enterpriseType.value === 'upstream') return 4
  if (enterpriseType.value === 'midstream') return 4
  if (enterpriseType.value === 'downstream') return 4
  return 4
}

const generateBatchNo = () => {
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  const batchNo = `B${dateStr}${random}`
  
  if (enterpriseType.value === 'upstream') {
    upstreamForm.value.base.batchNo = batchNo
  } else if (enterpriseType.value === 'midstream') {
    midstreamForm.value.production.productBatchNo = batchNo
  } else if (enterpriseType.value === 'downstream') {
    downstreamForm.value.trace.batchNo = batchNo
  }
}

const nextStep = async () => {
  let formRef = null
  let rules = null
  
  if (enterpriseType.value === 'upstream') {
    if (currentStep.value === 0) {
      formRef = baseFormRef.value
      rules = upstreamRules.base
    } else if (currentStep.value === 1) {
      formRef = qualityFormRef.value
      rules = upstreamRules.quality
    }
  } else if (enterpriseType.value === 'midstream') {
    if (currentStep.value === 0) {
      formRef = receiveFormRef.value
      rules = midstreamRules.receive
    } else if (currentStep.value === 1) {
      formRef = productionFormRef.value
      rules = midstreamRules.production
    } else if (currentStep.value === 2) {
      formRef = qualityFormRef.value
      rules = midstreamRules.quality
    }
  } else if (enterpriseType.value === 'downstream') {
    if (currentStep.value === 0) {
      formRef = receiveFormRef.value
      rules = downstreamRules.receive
    } else if (currentStep.value === 1) {
      formRef = logisticsFormRef.value
      rules = downstreamRules.logistics
    }
  }
  
  if (formRef) {
    try {
      await formRef.validate()
      currentStep.value++
    } catch (error) {
      ElMessage.warning('请填写完整信息')
    }
  } else {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const handleSaveDraft = async () => {
  try {
    let formData = {}
    if (enterpriseType.value === 'upstream') {
      formData = upstreamForm.value
    } else if (enterpriseType.value === 'midstream') {
      formData = midstreamForm.value
    } else if (enterpriseType.value === 'downstream') {
      formData = downstreamForm.value
    }
    
    await saveDraft(formData, enterpriseType.value)
    ElMessage.success('草稿保存成功')
    hasDraft.value = true
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const loadDraft = () => {
  loadDraftFromServer()
}

const handlePreview = () => {
  let data = {}
  if (enterpriseType.value === 'upstream') {
    data = { ...upstreamForm.value.base, ...upstreamForm.value.quality }
  } else if (enterpriseType.value === 'midstream') {
    data = {
      ...midstreamForm.value.receive,
      ...midstreamForm.value.production,
      ...midstreamForm.value.quality
    }
  } else if (enterpriseType.value === 'downstream') {
    data = {
      ...downstreamForm.value.receive,
      ...downstreamForm.value.logistics,
      ...downstreamForm.value.trace
    }
  }
  previewData.value = data
  previewVisible.value = true
}

const handleSubmit = async () => {
  try {
    let formData = {}
    if (enterpriseType.value === 'upstream') {
      formData = upstreamForm.value
    } else if (enterpriseType.value === 'midstream') {
      formData = midstreamForm.value
    } else if (enterpriseType.value === 'downstream') {
      formData = downstreamForm.value
    }
    
    await submitDataReport(formData, enterpriseType.value)
    ElMessage.success('数据上报成功')
    // 重置表单
    currentStep.value = 0
  } catch (error) {
    ElMessage.error('提交失败：' + (error.message || '未知错误'))
  }
}

// 碳排放计算函数
const calculateCarbonFootprint = (type) => {
  let carbonFootprint = 0
  
  if (type === 'upstream') {
    // 上游：运输碳排放
    const distance = upstreamForm.value.base.transportDistance || 0
    const method = upstreamForm.value.base.transportMethod
    
    // 碳排放因子（kg CO2e/km·kg）
    const emissionFactors = {
      road: 0.15,
      railway: 0.03,
      waterway: 0.01,
      air: 0.5
    }
    
    const factor = emissionFactors[method] || 0.15
    const quantity = upstreamForm.value.base.productionQuantity || 0
    carbonFootprint = distance * factor * (quantity / 1000) // 转换为吨
    
  } else if (type === 'midstream') {
    // 中游：生产能耗 + 包装材料
    const power = midstreamForm.value.production.powerConsumption || 0
    const fuel = midstreamForm.value.production.fuelConsumption || 0
    const packagingWeight = midstreamForm.value.quality.packagingWeight || 0
    const packagingType = midstreamForm.value.quality.packagingType
    
    // 电力碳排放因子：0.5 kg CO2e/kWh
    // 燃料碳排放因子：2.3 kg CO2e/L
    const powerEmission = power * 0.5
    const fuelEmission = fuel * 2.3
    
    // 包装材料碳排放因子（kg CO2e/kg）
    const packagingFactors = {
      cardboard: 1.2,
      plastic_bag: 2.5,
      glass: 0.8,
      metal: 1.5
    }
    const packagingFactor = packagingFactors[packagingType] || 1.2
    const packagingEmission = packagingWeight * packagingFactor
    
    carbonFootprint = powerEmission + fuelEmission + packagingEmission
    
  } else if (type === 'downstream') {
    // 下游：物流运输 + 包装回收
    const distance = downstreamForm.value.logistics.logisticsDistance || 0
    const method = downstreamForm.value.logistics.logisticsMethod
    const recycleRate = downstreamForm.value.logistics.packagingRecycleRate || 0
    
    const emissionFactors = {
      road: 0.15,
      railway: 0.03,
      waterway: 0.01,
      air: 0.5
    }
    
    const factor = emissionFactors[method] || 0.15
    const quantity = downstreamForm.value.receive.receiveQuantity || 0
    const transportEmission = distance * factor * (quantity / 1000)
    
    // 包装回收减少碳排放（假设回收率越高，碳排放越少）
    const packagingEmission = transportEmission * 0.1 * (1 - recycleRate / 100)
    
    carbonFootprint = transportEmission - packagingEmission
  }
  
  // 更新对应表单的碳排放值
  if (type === 'upstream') {
    upstreamForm.value.base.carbonFootprint = carbonFootprint.toFixed(2)
  } else if (type === 'midstream') {
    midstreamForm.value.production.carbonFootprint = carbonFootprint.toFixed(2)
  } else if (type === 'downstream') {
    downstreamForm.value.logistics.carbonFootprint = carbonFootprint.toFixed(2)
  }
  
  ElMessage.success(`碳排放计算完成：${carbonFootprint.toFixed(2)} kg CO₂e`)
}

// 区块链相关函数
const getBlockchainStatusName = (status) => {
  const map = {
    not_on_chain: '未上链',
    processing: '上链中',
    success: '已上链',
    failed: '上链失败'
  }
  return map[status] || status
}

const getBlockchainStatusTagType = (status) => {
  const map = {
    not_on_chain: 'info',
    processing: 'warning',
    success: 'success',
    failed: 'danger'
  }
  return map[status] || ''
}

const getBlockchainStatusType = (status) => {
  const map = {
    not_on_chain: 'info',
    processing: 'warning',
    success: 'success',
    failed: 'error'
  }
  return map[status] || 'info'
}

const getBlockchainStatusText = (blockchain) => {
  if (blockchain.status === 'not_on_chain') {
    return '数据尚未上链，点击"立即上链"按钮进行区块链存证'
  } else if (blockchain.status === 'processing') {
    return '数据正在上链中，请稍候...'
  } else if (blockchain.status === 'success') {
    return `数据已成功上链，区块高度：${blockchain.blockHeight}`
  } else {
    return '数据上链失败，请重试'
  }
}

const handleOnChain = async (type) => {
  try {
    let formData = {}
    if (type === 'upstream') {
      upstreamForm.value.blockchain.status = 'processing'
      formData = upstreamForm.value
    } else if (type === 'midstream') {
      midstreamForm.value.blockchain.status = 'processing'
      formData = midstreamForm.value
    } else if (type === 'downstream') {
      downstreamForm.value.blockchain.status = 'processing'
      formData = downstreamForm.value
    }
    
    // 模拟上链过程
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 模拟上链成功
    const hash = `0x${Math.random().toString(16).substr(2, 64)}`
    const blockHeight = Math.floor(Math.random() * 1000000) + 1000000
    
    if (type === 'upstream') {
      upstreamForm.value.blockchain.status = 'success'
      upstreamForm.value.blockchain.hash = hash
      upstreamForm.value.blockchain.onChainTime = new Date().toLocaleString('zh-CN')
      upstreamForm.value.blockchain.blockHeight = blockHeight
    } else if (type === 'midstream') {
      midstreamForm.value.blockchain.status = 'success'
      midstreamForm.value.blockchain.hash = hash
      midstreamForm.value.blockchain.onChainTime = new Date().toLocaleString('zh-CN')
      midstreamForm.value.blockchain.blockHeight = blockHeight
    } else if (type === 'downstream') {
      downstreamForm.value.blockchain.status = 'success'
      downstreamForm.value.blockchain.hash = hash
      downstreamForm.value.blockchain.onChainTime = new Date().toLocaleString('zh-CN')
      downstreamForm.value.blockchain.blockHeight = blockHeight
    }
    
    ElMessage.success('数据上链成功')
  } catch (error) {
    if (type === 'upstream') {
      upstreamForm.value.blockchain.status = 'failed'
    } else if (type === 'midstream') {
      midstreamForm.value.blockchain.status = 'failed'
    } else if (type === 'downstream') {
      downstreamForm.value.blockchain.status = 'failed'
    }
    ElMessage.error('数据上链失败：' + (error.message || '未知错误'))
  }
}

const copyHash = (hash) => {
  navigator.clipboard.writeText(hash).then(() => {
    ElMessage.success('哈希值已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

onMounted(async () => {
  const info = await getCurrentEnterprise()
  enterpriseType.value = info.type
  await checkDraft()
})

const checkDraft = async () => {
  try {
    const result = await getLatestDraft(enterpriseType.value)
    hasDraft.value = !!result?.hasDraft
  } catch (e) {
    hasDraft.value = false
  }
}

const loadDraftFromServer = async () => {
  try {
    const result = await getLatestDraft(enterpriseType.value)
    if (!result?.hasDraft || !result?.draft?.data) {
      ElMessage.info('暂无可加载草稿')
      return
    }
    const data = result.draft.data
    if (enterpriseType.value === 'upstream') {
      upstreamForm.value = data
    } else if (enterpriseType.value === 'midstream') {
      midstreamForm.value = data
    } else if (enterpriseType.value === 'downstream') {
      downstreamForm.value = data
    }
    ElMessage.success('草稿加载成功')
  } catch (e) {
    ElMessage.error('加载草稿失败')
  }
}
</script>

<style scoped>
.data-report {
  padding: 0;
  min-height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-container {
  margin: 40px 0;
  min-height: 400px;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
}
</style>
