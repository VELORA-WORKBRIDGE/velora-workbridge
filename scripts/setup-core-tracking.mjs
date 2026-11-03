import {execFileSync} from 'node:child_process';
const repo=process.env.GITHUB_REPOSITORY;
if(repo!=='withkoji/velora-workbridge')throw Error('Unexpected repository');
function api(path,method='GET',body){return JSON.parse(execFileSync('gh',['api',path,'--method',method,...(body?['--input','-']:[])],{input:body?JSON.stringify(body):undefined,encoding:'utf8'}));}
const root='repos/'+repo;
const labels=[
['brand:core','244f3f','Shared VELORA VIVIA WORKBRIDGE core'],
['brand:velora','66994d','Health wellbeing and self-care'],
['brand:vivia','b79b64','Rental services and applications'],
['brand:workbridge','65889e','Jobs and career applications'],
['type:epic','5b3d91','Parent delivery tracker'],
['type:feature','a2eeef','Scoped implementation work'],
['area:integration','0075ca','Authorized connectors and data exchange'],
['area:security','b60205','Identity privacy and access boundaries'],
['area:delivery','5319e7','CI packaging deployment and release'],
['area:experience','bfdadc','User experience accessibility and localization'],
['priority:high','d93f0b','Blocks shared integration or deployment acceptance'],
['status:scoped','e4e669','Defined work awaiting implementation'],
['release:v0.1.0','c5def5','Follow-up from the initial published hub release']
];
for(const [name,color,description]of labels){
const existing=api(root+'/labels?per_page=100').find(l=>l.name===name);
api(root+'/labels'+(existing?'/'+encodeURIComponent(name):''),existing?'PATCH':'POST',{name,color,description});
}
let all=[];for(let page=1;;page++){const batch=api(root+'/issues?state=all&per_page=100&page='+page);all.push(...batch.filter(x=>!x.pull_request));if(batch.length<100)break;}
function issue(title,body,labels){let i=all.find(x=>x.title===title);if(!i){i=api(root+'/issues','POST',{title,body,labels});all.push(i);}return i;}
const release='https://github.com/'+repo+'/releases/tag/v0.1.0';
const parent=issue('[Core] VELORA · VIVIA · WORKBRIDGE delivery tracker','Track the next implementation work after the published initial hub release.\n\nBaseline: '+release+'\n\nThe hub currently offers portal navigation and a browser-local checklist. Live connector sync, shared identity and operational records remain pending. Child work must supply evidence before any readiness claim.\n\nChild list will be populated by this setup run.',['type:epic','brand:core','status:scoped','release:v0.1.0']);
const plans=[
['[Core] Define shared workflow contracts and record ownership','brand:core','area:integration','None; foundation for brand integrations.','Document identifiers, authoritative systems, statuses, allowed transitions and one payment source per booking. Separate reminders from verified operational records.','A reviewed contract maps every brand event to its owner, access rules, retry behavior and evidence required for state changes.'],
['[VELORA] Scope verified wellness booking and self-care workflows','brand:velora','area:integration','Shared workflow contracts and connector-access verification.','Map the existing VELORA portal to supported booking/product functions. Document 50% deposit and balance handling where applicable. Keep appointment verification separate from payment evidence; leave existing sandbox boundaries intact.','Document actual supported portal operations; no confirmation or fulfillment occurs from a portal visit, draft or unpaid event. Link existing booking-commerce #20/#29/#34 rather than duplicating their implementation.'],
['[VIVIA] Map rental listings and application follow-up','brand:vivia','area:integration','Shared workflow contracts and connector-access verification.','Identify the authoritative VIVIA listings and applications workspace; resolve account/resource mapping before writes. Define listing provenance and permitted application status display.','Verified resource mapping and authorized status reads are demonstrated. Personal checklist completion never marks an application approved; no automated eligibility decisions are introduced.'],
['[WORKBRIDGE] Map job discovery and application workflow','brand:workbridge','area:integration','Shared workflow contracts and connector-access verification.','Map the WORKBRIDGE portal and application states. Link remote-search validation limitations from withkoji/ai-job-search PR #2. Separate imported search data from verified employer identity, availability and remote eligibility.','Document supported application operations and label unverified job evidence clearly. No hire or eligibility outcome is inferred from an import or reminder.'],
['[Core] Verify hosted GitHub Zite and Google connector access','brand:core','area:integration','Hosting capability and eligible connector discovery must be available.','Discover supported hosted connectors, resolve account/resource selection and declare only required access. Implement bounded server-owned actions and independent loading, refresh and error states.','Demonstrate hosted authorized reads, sign-in return and refresh. Record unavailable capabilities explicitly. Writes require a defined target and deliberate user action; no credential proxy or browser-side secrets.'],
['[Core] Design identity roles and privacy boundaries','brand:core','area:security','Shared workflow contracts; required before private operational data is exposed.','Define owner/operator/provider/candidate/customer access as needed, with least privilege and visitor data isolation. Document retention and checklist storage limitations.','Unauthorized requests cannot read or change another user’s records; no secrets or sensitive payloads reach source or logs. Access boundaries are verified before enabling brand data integrations.'],
['[Core] Connect GitHub delivery to the hosted hub','brand:core','area:delivery','Existing Site identity, audience and source binding verified; app validation must pass.','Define explicit source branch and publishing process for the existing owner-private Site. Preserve its identity and access. Document release promotion and rollback without creating a second deployment accidentally.','A verified source revision is deployed through the supported process and rollback is documented. A GitHub merge alone is never reported as a deployed Site change.'],
['[Core] Harden release and container package handoff','brand:core','area:delivery','Review release automation PR #2 and successful v0.1.0 publication evidence.','Document private package pull access, image digest, ZIP checksum and version policy. Review base image pinning, dependency updates and least-privilege runtime before wider deployment.','Release assets and package digest match the tested revision; version tags are not overwritten; installation and rollback instructions are usable.'],
['[Core] Verify mobile desktop accessibility and EN/ES experience','brand:core','area:experience','Current app baseline; repeat after connector UI changes.','Test keyboard access, readable contrast, responsive layout, modal focus, installation guidance, local checklist persistence and empty/error states. Scope English/Spanish localization without claiming it already exists.','Record device/browser results and bounded defects. Translate the approved UI with a working language control; explain that browser-local data does not sync across devices.']
];
const children=[];
for(const [title,brand,area,deps,scope,acceptance]of plans){
const child=issue(title,'Parent: #'+parent.number+'\nBaseline release: '+release+'\n\n## Dependencies\n'+deps+'\n\n## Scope\n'+scope+'\n\n## Acceptance criteria\n'+acceptance+'\n\n## Completion evidence\nLink the implementing PR, validation results and any remaining limitation before closure.',['type:feature',brand,area,'status:scoped','release:v0.1.0',...(['area:security'].includes(area)||title.includes('contracts')||title.includes('connector access')?['priority:high']:[])]);
const existing=api(root+'/issues/'+parent.number+'/sub_issues?per_page=100');
if(!existing.some(i=>i.id===child.id))api(root+'/issues/'+parent.number+'/sub_issues','POST',{sub_issue_id:child.id});
children.push(child);
}
api(root+'/issues/'+parent.number,'PATCH',{body:'Track the next implementation work after the published initial hub release.\n\nBaseline: '+release+'\n\nThe hub currently offers portal navigation and a browser-local checklist. Live connector sync, shared identity and operational records remain pending.\n\n## Sub-issues\n'+children.map(i=>'- [ ] #'+i.number+' — '+i.title).join('\n')+'\n\n## Execution order\n1. Contracts and identity design.\n2. Hosted connector capability/access verification.\n3. Brand-specific integrations with authorization in place.\n4. Delivery handoff and end-to-end experience verification.\n\nRelease/package review and baseline accessibility checks can proceed independently.\n\n## Completion gate\nClose only after child acceptance evidence is recorded or a documented scope decision explicitly defers nonblocking work. Unavailable connectors and security failures do not count as integration success. No live payment readiness is implied.\n\n## Related work\n- App import: '+root.replace('repos/','https://github.com/')+'/pull/1\n- Release automation: https://github.com/'+repo+'/pull/2\n- Booking acceptance: https://github.com/withkoji/velora-booking-commerce/issues/34\n\nIssue tags use brand, area, type, priority, status and release labels. The published Git tag v0.1.0 is preserved.'});
console.log(JSON.stringify({parent:parent.html_url,children:children.map(i=>({number:i.number,url:i.html_url})),labels:labels.map(x=>x[0])},null,2));
