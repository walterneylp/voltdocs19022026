update public.field_updates fu
set event_report = true
from public.assets a
where fu.event_report is false
  and fu.base_path = a.id
  and fu.code = a.tag;
