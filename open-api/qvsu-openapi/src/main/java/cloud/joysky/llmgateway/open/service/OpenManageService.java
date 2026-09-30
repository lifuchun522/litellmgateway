package cloud.joysky.llmgateway.open.service;

import cloud.joysky.llmgateway.common.core.text.Convert;
import cloud.joysky.llmgateway.common.utils.StringUtils;
import cloud.joysky.llmgateway.open.domain.OpenApi;
import cloud.joysky.llmgateway.open.domain.OpenApiDoc;
import cloud.joysky.llmgateway.open.domain.OpenApp;
import cloud.joysky.llmgateway.open.domain.OpenCallLog;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OpenManageService
{
    private static final Logger log = LoggerFactory.getLogger(OpenManageService.class);

    private final JdbcTemplate jdbcTemplate;

    public OpenManageService(JdbcTemplate jdbcTemplate)
    {
        this.jdbcTemplate = jdbcTemplate;
    }

    // ==================== App ====================

    public List<OpenApp> selectAppList(OpenApp query)
    {
        StringBuilder sql = new StringBuilder(
                "select s_id, app_name, app_key, app_secret, contact, status, expire_time, remark, "
                        + "create_time as s_created_time, update_time as s_updated_time from open_app where 1=1");
        List<Object> args = new ArrayList<Object>();
        Optional.ofNullable(query)
                .ifPresent(q -> {
                    if (StringUtils.isNotBlank(q.getAppName()))
                    {
                        sql.append(" and app_name like '%' || ? || '%'");
                        args.add(q.getAppName());
                    }
                    if (StringUtils.isNotBlank(q.getAppKey()))
                    {
                        sql.append(" and app_key like '%' || ? || '%'");
                        args.add(q.getAppKey());
                    }
                    if (q.getStatus() != null)
                    {
                        sql.append(" and status = ?");
                        args.add(q.getStatus());
                    }
                });
        sql.append(" order by s_id desc");
        return jdbcTemplate.query(sql.toString(), new BeanPropertyRowMapper<OpenApp>(OpenApp.class), args.toArray());
    }

    public OpenApp selectAppById(Long sId)
    {
        List<OpenApp> list = jdbcTemplate.query(
                "select s_id, app_name, app_key, app_secret, contact, status, expire_time, remark, "
                        + "create_time as s_created_time, update_time as s_updated_time from open_app where s_id=?",
                new BeanPropertyRowMapper<OpenApp>(OpenApp.class),
                sId);
        return list.isEmpty() ? null : list.get(0);
    }

    public OpenApp selectAppByAppKey(String appKey)
    {
        List<OpenApp> list = jdbcTemplate.query(
                "select s_id, app_name, app_key, app_secret, contact, status, expire_time, remark, "
                        + "create_time as s_created_time, update_time as s_updated_time "
                        + "from open_app where app_key=? and status=1",
                new BeanPropertyRowMapper<OpenApp>(OpenApp.class),
                appKey);
        return list.isEmpty() ? null : list.get(0);
    }

    public OpenApp selectUsableAppByApiId(Long apiId)
    {
        List<OpenApp> list = jdbcTemplate.query(
                "select a.s_id, a.app_name, a.app_key, a.app_secret, a.contact, a.status, a.expire_time, a.remark, "
                        + "a.create_time as s_created_time, a.update_time as s_updated_time "
                        + "from open_app a inner join open_app_api aa on a.s_id = aa.app_id "
                        + "where aa.api_id=? and a.status=1 and (a.expire_time is null or a.expire_time > now()) "
                        + "order by a.s_id desc limit 1",
                new BeanPropertyRowMapper<OpenApp>(OpenApp.class),
                apiId);
        return list.isEmpty() ? null : list.get(0);
    }

    @Transactional
    public int insertApp(OpenApp app)
    {
        String appKey = StringUtils.isNotBlank(app.getAppKey()) ? app.getAppKey() : genAppKey();
        String appSecret = StringUtils.isNotBlank(app.getAppSecret()) ? app.getAppSecret() : genAppSecret();
        Integer status = Optional.ofNullable(app.getStatus()).orElse(1);
        log.info("[OpenAPI] 新增应用: appName={}, appKey={}", app.getAppName(), appKey);
        return jdbcTemplate.update(
                "insert into open_app(app_name, app_key, app_secret, contact, status, expire_time, remark, create_time, update_time) "
                        + "values(?,?,?,?,?,?,?,now(),now())",
                app.getAppName(), appKey, appSecret, app.getContact(), status, app.getExpireTime(), app.getRemark());
    }

    public int updateApp(OpenApp app)
    {
        log.info("[OpenAPI] 更新应用: sId={}, appName={}", app.getsId(), app.getAppName());
        return jdbcTemplate.update(
                "update open_app set app_name=?, contact=?, status=?, expire_time=?, remark=?, update_time=now() where s_id=?",
                app.getAppName(), app.getContact(), app.getStatus(), app.getExpireTime(), app.getRemark(), app.getsId());
    }

    @Transactional
    public int deleteAppByIds(String ids)
    {
        log.info("[OpenAPI] 删除应用: ids={}", ids);
        Long[] array = Convert.toLongArray(ids);
        if (array.length == 0)
        {
            return 0;
        }
        String inSql = Arrays.stream(array).map(String::valueOf).collect(Collectors.joining(","));
        jdbcTemplate.update("delete from open_app_api where app_id in (" + inSql + ")");
        return jdbcTemplate.update("delete from open_app where s_id in (" + inSql + ")");
    }

    public String resetSecret(Long appId)
    {
        log.info("[OpenAPI] 重置应用密钥: appId={}", appId);
        String newSecret = genAppSecret();
        int count = jdbcTemplate.update("update open_app set app_secret=?, update_time=now() where s_id=?", newSecret, appId);
        if (count == 0)
        {
            log.error("[OpenAPI] 重置密钥失败，应用不存在: appId={}", appId);
            throw new RuntimeException("app not found");
        }
        return newSecret;
    }

    // ==================== Api ====================

    public List<OpenApi> selectApiList(OpenApi query)
    {
        StringBuilder sql = new StringBuilder(
                "select s_id, api_name, api_path, method, target_url, timeout_ms, status, need_sign, description, req_example, resp_example, "
                        + "create_time as s_created_time from open_api where 1=1");
        List<Object> args = new ArrayList<Object>();
        Optional.ofNullable(query)
                .ifPresent(q -> {
                    if (StringUtils.isNotBlank(q.getApiName()))
                    {
                        sql.append(" and api_name like '%' || ? || '%'");
                        args.add(q.getApiName());
                    }
                    if (StringUtils.isNotBlank(q.getApiPath()))
                    {
                        sql.append(" and api_path like '%' || ? || '%'");
                        args.add(q.getApiPath());
                    }
                    if (q.getStatus() != null)
                    {
                        sql.append(" and status = ?");
                        args.add(q.getStatus());
                    }
                });
        sql.append(" order by s_id desc");
        return jdbcTemplate.query(sql.toString(), new BeanPropertyRowMapper<OpenApi>(OpenApi.class), args.toArray());
    }

    public OpenApi selectApiById(Long sId)
    {
        List<OpenApi> list = jdbcTemplate.query(
                "select s_id, api_name, api_path, method, target_url, timeout_ms, status, need_sign, description, req_example, resp_example, "
                        + "create_time as s_created_time from open_api where s_id=?",
                new BeanPropertyRowMapper<OpenApi>(OpenApi.class),
                sId);
        return list.isEmpty() ? null : list.get(0);
    }

    public OpenApi selectApiByPath(String apiPath, String method)
    {
        List<OpenApi> list = jdbcTemplate.query(
                "select s_id, api_name, api_path, method, target_url, timeout_ms, status, need_sign, description, req_example, resp_example, "
                        + "create_time as s_created_time from open_api where api_path=? and method=? and status=1",
                new BeanPropertyRowMapper<OpenApi>(OpenApi.class),
                apiPath, method);
        return list.isEmpty() ? null : list.get(0);
    }

    @Transactional
    public int insertApi(OpenApi api)
    {
        log.info("[OpenAPI] 新增接口: apiName={}, apiPath={}, method={}", api.getApiName(), api.getApiPath(), api.getMethod());
        return jdbcTemplate.update(
                "insert into open_api(api_name, api_path, method, target_url, timeout_ms, status, need_sign, description, req_example, resp_example, create_time) "
                        + "values(?,?,?,?,?,?,?,?,?,?,now())",
                api.getApiName(),
                api.getApiPath(),
                Optional.ofNullable(api.getMethod()).orElse("POST"),
                api.getTargetUrl(),
                Optional.ofNullable(api.getTimeoutMs()).orElse(5000),
                Optional.ofNullable(api.getStatus()).orElse(1),
                Optional.ofNullable(api.getNeedSign()).orElse(1),
                api.getDescription(),
                api.getReqExample(),
                api.getRespExample());
    }

    public int updateApi(OpenApi api)
    {
        log.info("[OpenAPI] 更新接口: sId={}, apiName={}, apiPath={}", api.getsId(), api.getApiName(), api.getApiPath());
        return jdbcTemplate.update(
                "update open_api set api_name=?, api_path=?, method=?, target_url=?, timeout_ms=?, status=?, need_sign=?, description=?, req_example=?, resp_example=? where s_id=?",
                api.getApiName(), api.getApiPath(), api.getMethod(), api.getTargetUrl(), api.getTimeoutMs(), api.getStatus(),
                api.getNeedSign(), api.getDescription(), api.getReqExample(), api.getRespExample(), api.getsId());
    }

    @Transactional
    public int deleteApiByIds(String ids)
    {
        log.info("[OpenAPI] 删除接口: ids={}", ids);
        Long[] array = Convert.toLongArray(ids);
        if (array.length == 0)
        {
            return 0;
        }
        String inSql = Arrays.stream(array).map(String::valueOf).collect(Collectors.joining(","));
        jdbcTemplate.update("delete from open_app_api where api_id in (" + inSql + ")");
        return jdbcTemplate.update("delete from open_api where s_id in (" + inSql + ")");
    }

    // ==================== Auth ====================

    public List<Map<String, Object>> listAppOptions()
    {
        return jdbcTemplate.queryForList("select s_id as id, app_name as appName, app_key as appKey from open_app where status=1 order by s_id desc");
    }

    public List<Map<String, Object>> listApiOptions()
    {
        return jdbcTemplate.queryForList("select s_id as id, api_name as apiName, api_path as apiPath, method from open_api where status=1 order by s_id desc");
    }

    public List<Long> listAuthorizedApiIds(Long appId)
    {
        return jdbcTemplate.query("select api_id from open_app_api where app_id=?", (rs, rowNum) -> rs.getLong("api_id"), appId);
    }

    @Transactional
    public void saveAppAuth(Long appId, List<Long> apiIds)
    {
        log.info("[OpenAPI] 保存应用授权: appId={}, apiCount={}", appId, apiIds == null ? 0 : apiIds.size());
        jdbcTemplate.update("delete from open_app_api where app_id=?", appId);

        if (apiIds == null || apiIds.isEmpty())
        {
            return;
        }

        List<Object[]> batchArgs = apiIds.stream()
                .distinct()
                .map(apiId -> new Object[] { appId, apiId })
                .collect(Collectors.toList());

        jdbcTemplate.batchUpdate(
                "insert into open_app_api(app_id, api_id, create_time) values(?,?,now()) "
                        + "on conflict (app_id, api_id) do update set update_time=now()",
                batchArgs);
        log.info("[OpenAPI] 应用授权保存成功: appId={}", appId);
    }

    // ==================== Log ====================

    public List<OpenCallLog> selectLogList(OpenCallLog query)
    {
        StringBuilder sql = new StringBuilder(
                "select s_id, trace_id, app_key, app_name, api_path, method, req_body, resp_code, resp_body, cost_ms, status, error_msg, client_ip, call_time, call_time as s_created_time "
                        + "from open_call_log where 1=1");

        List<Object> args = new ArrayList<Object>();
        Optional.ofNullable(query)
                .ifPresent(q -> {
                    if (StringUtils.isNotBlank(q.getTraceId()))
                    {
                        sql.append(" and trace_id = ?");
                        args.add(q.getTraceId());
                    }
                    if (StringUtils.isNotBlank(q.getAppKey()))
                    {
                        sql.append(" and app_key = ?");
                        args.add(q.getAppKey());
                    }
                    if (StringUtils.isNotBlank(q.getApiPath()))
                    {
                        sql.append(" and api_path like '%' || ? || '%'");
                        args.add(q.getApiPath());
                    }
                    if (q.getStatus() != null)
                    {
                        sql.append(" and status = ?");
                        args.add(q.getStatus());
                    }
                    Map<String, Object> params = q.getParams();
                    String beginTime = params.get("beginTime") == null ? null : String.valueOf(params.get("beginTime"));
                    String endTime = params.get("endTime") == null ? null : String.valueOf(params.get("endTime"));
                    if (StringUtils.isNotBlank(beginTime))
                    {
                        sql.append(" and call_time >= ?");
                        args.add(beginTime);
                    }
                    if (StringUtils.isNotBlank(endTime))
                    {
                        sql.append(" and call_time <= ?");
                        args.add(endTime);
                    }
                });
        sql.append(" order by s_id desc");
        return jdbcTemplate.query(sql.toString(), new BeanPropertyRowMapper<OpenCallLog>(OpenCallLog.class), args.toArray());
    }

    public int insertCallLog(OpenCallLog log)
    {
        return jdbcTemplate.update(
                "insert into open_call_log(trace_id, app_key, app_name, api_path, method, req_body, resp_code, resp_body, cost_ms, status, error_msg, client_ip, call_time) values(?,?,?,?,?,?,?,?,?,?,?,?,?)",
                log.getTraceId(), log.getAppKey(), log.getAppName(), log.getApiPath(), log.getMethod(),
                log.getReqBody(), log.getRespCode(), log.getRespBody(), log.getCostMs(), log.getStatus(),
                log.getErrorMsg(), log.getClientIp(), log.getCallTime());
    }

    public Map<String, Object> queryLogStatsToday()
    {
        Map<String, Object> result = new HashMap<String, Object>();
        Map<String, Object> base = jdbcTemplate.queryForMap(
                "select count(1) totalCalls, coalesce(sum(case when status=0 then 1 else 0 end),0) successCalls, "
                        + "coalesce(round(avg(cost_ms)::numeric,2),0) avgCost "
                        + "from open_call_log where call_time::date = current_date");
        long totalCalls = Convert.toLong(base.get("totalCalls"));
        long successCalls = Convert.toLong(base.get("successCalls"));
        double successRate = totalCalls == 0 ? 0D : (successCalls * 100D / totalCalls);

        result.put("totalCalls", totalCalls);
        result.put("successRate", String.format("%.2f", successRate));
        result.put("avgCost", base.get("avgCost"));
        result.put("topApps", jdbcTemplate.queryForList(
                "select app_name appName, count(1) callCount from open_call_log where call_time::date = current_date "
                        + "group by app_name order by callCount desc limit 5"));
        return result;
    }

    // ==================== Doc ====================

    public List<OpenApiDoc> selectDocList()
    {
        return jdbcTemplate.query(
                "select s_id, app_id, doc_title, doc_version, api_ids, html_content, create_time as s_created_time from open_api_doc order by s_id desc",
                new BeanPropertyRowMapper<OpenApiDoc>(OpenApiDoc.class));
    }

    public int saveDoc(OpenApiDoc doc)
    {
        return jdbcTemplate.update(
                "insert into open_api_doc(app_id, doc_title, doc_version, api_ids, html_content, create_time) values(?,?,?,?,?,now())",
                doc.getAppId(), doc.getDocTitle(), doc.getDocVersion(), doc.getApiIds(), doc.getHtmlContent());
    }

    public List<OpenApi> selectApisByIds(List<Long> ids)
    {
        if (ids == null || ids.isEmpty())
        {
            return Collections.emptyList();
        }
        String inSql = ids.stream().map(String::valueOf).collect(Collectors.joining(","));
        return jdbcTemplate.query(
                "select s_id, api_name, api_path, method, target_url, timeout_ms, status, need_sign, description, req_example, resp_example, "
                        + "create_time as s_created_time from open_api where s_id in (" + inSql + ") order by s_id",
                new BeanPropertyRowMapper<OpenApi>(OpenApi.class));
    }

    // ==================== util ====================

    private String genAppKey()
    {
        return "ak_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }

    private String genAppSecret()
    {
        return "sk_" + UUID.randomUUID().toString().replace("-", "");
    }
}
